// lambda/create.ts
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient();

export const handler = async (event: any) => {
    try {
        const data = JSON.parse(event.body);
        const id = uuidv4();
        
        const params = {
            TableName: process.env.TABLE_NAME!,
            Item: {
                id,
                userId: event.requestContext.authorizer.claims.sub,
                ...data,
                createdAt: new Date().toISOString(),
            }
        };

        await dynamodb.put(params).promise();

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ id, ...data })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Could not create item" })
        };
    }
};