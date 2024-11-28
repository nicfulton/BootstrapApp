// lambda/create.ts
import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Get user information from Cognito claims
        const userId = event.requestContext.authorizer?.claims.sub;
        const userEmail = event.requestContext.authorizer?.claims.email;

        if (!userId) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: "Unauthorized" })
            };
        }

        const data = JSON.parse(event.body || '{}');
        const id = uuidv4();
        
        const params = {
            TableName: process.env.TABLE_NAME!,
            Item: {
                id,
                userId,
                userEmail,
                ...data,
                createdAt: new Date().toISOString(),
            }
        };

        await dynamodb.put(params).promise();

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ 
                id,
                userId,
                userEmail,
                ...data 
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ error: "Could not create item" })
        };
    }
};