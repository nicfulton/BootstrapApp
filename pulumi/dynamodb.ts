import * as aws from "@pulumi/aws";

// Create DynamoDB table
export const table = new aws.dynamodb.Table("app-table", {
    attributes: [
        { name: "id", type: "S" },
        { name: "userId", type: "S" },
    ],
    hashKey: "id",
    globalSecondaryIndexes: [
        {
            name: "UserIndex",
            hashKey: "userId",
            projectionType: "ALL",
            readCapacity: 5,
            writeCapacity: 5,
        },
    ],
    billingMode: "PROVISIONED",
    readCapacity: 5,
    writeCapacity: 5,
});

// Create custom policy for DynamoDB access
export const dynamoPolicy = new aws.iam.Policy("dynamo-policy", {
    policy: table.arn.apply(tableArn => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            Resource: [
                tableArn,
                `${tableArn}/index/*`
            ],
        }],
    })),
});

