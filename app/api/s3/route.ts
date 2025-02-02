import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bucketName = process.env.AWS_BUCKET_NAME;
    
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
    
    // List all files in the bucket
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });
    
    const response = await s3Client.send(command);
    
    return NextResponse.json({ files: response.Contents });
    
  } catch (error) {
    console.error('Error accessing S3:', error);
    return NextResponse.json(
      { error: 'Failed to access S3 bucket' },
      { status: 500 }
    );
  }
} 