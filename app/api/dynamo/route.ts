import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { NextResponse } from "next/server";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { contact, fileName } = await request.json();

    console.log("contact : ", contact)
    console.log("file name : ", fileName)
    const params = {
      TableName: "popup-contacts",
      Item: {
        "contact": { S: contact },
        "fileName": { S: fileName }
      }
    };

    const command = new PutItemCommand(params);
    await dynamoClient.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing in DynamoDB:', error);
    return NextResponse.json(
      { error: 'Failed to store contact information' },
      { status: 500 }
    );
  }
} 