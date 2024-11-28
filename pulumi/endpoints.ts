import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { userPoolId } from "./frontendauth"

// Create DynamoDB table
const table = new aws.dynamodb.Table("app-table", {
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

// Create custom policy for DynamoDB access
const dynamoPolicy = new aws.iam.Policy("dynamo-policy", {
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

// Attach DynamoDB policy to Lambda role
new aws.iam.RolePolicyAttachment("dynamo-policy-attachment", {
    role: lambdaRole.name,
    policyArn: dynamoPolicy.arn,
});

// Create Lambda functions
const createItemFunction = new aws.lambda.Function("create-item", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../lambda"),
    }),
    handler: "create.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    environment: {
        variables: {
            TABLE_NAME: table.name,
        },
    },
});

const getItemFunction = new aws.lambda.Function("get-item", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../lambda"),
    }),
    handler: "get.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    environment: {
        variables: {
            TABLE_NAME: table.name,
        },
    },
});

const updateItemFunction = new aws.lambda.Function("update-item", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../lambda"),
    }),
    handler: "update.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    environment: {
        variables: {
            TABLE_NAME: table.name,
        },
    },
});

const deleteItemFunction = new aws.lambda.Function("delete-item", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../lambda"),
    }),
    handler: "delete.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    environment: {
        variables: {
            TABLE_NAME: table.name,
        },
    },
});

// Create API Gateway
const api = new aws.apigateway.RestApi("api", {
    description: "API Gateway with Lambda and DynamoDB",
});

// Create API Gateway resources and methods
const itemsResource = new aws.apigateway.Resource("items", {
    restApi: api.id,
    parentId: api.rootResourceId,
    pathPart: "items",
});

// POST /items
const createIntegration = new aws.apigateway.Integration("create-integration", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "POST",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: createItemFunction.invokeArn,
});

const createMethod = new aws.apigateway.Method("create-method", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "POST",
    authorization: "COGNITO_USER_POOLS",
    authorizerId: userPoolId, // Reference to your Cognito User Pool
});

// GET /items/{id}
const itemResource = new aws.apigateway.Resource("item", {
    restApi: api.id,
    parentId: itemsResource.id,
    pathPart: "{id}",
});

const getIntegration = new aws.apigateway.Integration("get-integration", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "GET",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: getItemFunction.invokeArn,
});

const getMethod = new aws.apigateway.Method("get-method", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "GET",
    authorization: "COGNITO_USER_POOLS",
    authorizerId: userPoolId,
});

// PUT /items/{id}
const updateIntegration = new aws.apigateway.Integration("update-integration", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "PUT",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: updateItemFunction.invokeArn,
});

const updateMethod = new aws.apigateway.Method("update-method", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "PUT",
    authorization: "COGNITO_USER_POOLS",
    authorizerId: userPoolId,
});

// DELETE /items/{id}
const deleteIntegration = new aws.apigateway.Integration("delete-integration", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "DELETE",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: deleteItemFunction.invokeArn,
});

const deleteMethod = new aws.apigateway.Method("delete-method", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "DELETE",
    authorization: "COGNITO_USER_POOLS",
    authorizerId: userPoolId,
});

// Enable CORS
const corsOptions = new aws.apigateway.Method("cors-options", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "OPTIONS",
    authorization: "NONE",
    requestParameters: {
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true,
        "method.response.header.Access-Control-Allow-Origin": true,
    },
});

// Deploy the API
const deployment = new aws.apigateway.Deployment("api-deployment", {
    restApi: api.id,
});

const stage = new aws.apigateway.Stage("api-stage", {
    deployment: deployment.id,
    restApi: api.id,
    stageName: "dev",
});

// Grant Lambda permissions to API Gateway
const createPermission = new aws.lambda.Permission("create-permission", {
    action: "lambda:InvokeFunction",
    function: createItemFunction.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*`,
});

const getPermission = new aws.lambda.Permission("get-permission", {
    action: "lambda:InvokeFunction",
    function: getItemFunction.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*`,
});

const updatePermission = new aws.lambda.Permission("update-permission", {
    action: "lambda:InvokeFunction",
    function: updateItemFunction.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*`,
});

const deletePermission = new aws.lambda.Permission("delete-permission", {
    action: "lambda:InvokeFunction",
    function: deleteItemFunction.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*`,
});

// Export values
export const apiUrl = pulumi.interpolate`${stage.invokeUrl}/items`;
export const tableName = table.name;
export const tableArn = table.arn;
