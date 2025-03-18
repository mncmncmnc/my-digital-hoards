import { S3Client, ListObjectsV2Command, GetObjectCommand, _Object, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// Configure route for static export
export const dynamic = 'force-static';
export const revalidate = false;

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Enhanced Fisher-Yates shuffle with multiple passes
function shuffleArray(array: _Object[]): _Object[] {
  // Perform multiple shuffles
  for (let pass = 0; pass < 3; pass++) {
    // Regular Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    
    // Add a reverse pass for even more randomness
    array.reverse();
    
    // Add another random shuffle pass from the start
    for (let i = 0; i < array.length - 1; i++) {
      const j = Math.floor(Math.random() * (array.length - i)) + i;
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  return array;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bucketName = process.env.AWS_BUCKET_NAME;
    
    if (!bucketName) {
      throw new Error('AWS_BUCKET_NAME is not defined');
    }
    
    // If a specific file is requested
    const key = searchParams.get('key');
    
    if (key) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      
      const response = await s3Client.send(command);
      const arrayBuffer = await response.Body?.transformToByteArray();
      
      // Get the content type from S3 or fallback to octet-stream
      const contentType = response.ContentType || 'application/octet-stream';
      
      // Return the binary data with the correct content type
      return new Response(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
        },
      });
    }
    
    // List all files in the bucket with pagination
    const allFiles: _Object[] = [];
    let continuationToken: string | undefined = undefined;
    
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });
      
      const listResponse: ListObjectsV2CommandOutput = await s3Client.send(listCommand);
      
      if (listResponse.Contents) {
        allFiles.push(...listResponse.Contents);
      }
      
      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);
    
    // Create a copy and apply enhanced shuffling
    const shuffledFiles = shuffleArray([...allFiles]);
    
    return NextResponse.json({ files: shuffledFiles });
    
  } catch (error) {
    console.error('Error accessing S3:', error);
    return NextResponse.json(
      { error: 'Failed to access S3 bucket' },
      { status: 500 }
    );
  }
} 