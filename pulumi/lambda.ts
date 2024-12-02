import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as dynamodb from "./dynamodb";

// Create IAM role for Lambda
const lambdaRole = new aws.iam.Role("lambda-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
        }],
    }),
});

// Attach basic Lambda execution policy
new aws.iam.RolePolicyAttachment("lambda-basic", {
    role: lambdaRole.name,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

// Attach DynamoDB policy to Lambda role
new aws.iam.RolePolicyAttachment("dynamo-policy-attachment", {
    role: lambdaRole.name,
    policyArn: dynamodb.dynamoPolicy.arn,
});

// Create Lambda functions
export const createItemFunction = new aws.lambda.Function("create-item", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../lambda"),
    }),
    handler: "create.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    environment: {
        variables: {
            TABLE_NAME: dynamodb.table.name,
        },
    },
});

export const getItemFunction = new aws.lambda.Function("get-item", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../lambda"),
    }),
    handler: "get.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    environment: {
        variables: {
            TABLE_NAME: dynamodb.table.name,
        },
    },
});

export const updateItemFunction = new aws.lambda.Function("update-item", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../lambda"),
    }),
    handler: "update.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    environment: {
        variables: {
            TABLE_NAME: dynamodb.table.name,
        },
    },
});

export const deleteItemFunction = new aws.lambda.Function("delete-item", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../lambda"),
    }),
    handler: "delete.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    environment: {
        variables: {
            TABLE_NAME: dynamodb.table.name,
        },
    },
});
