import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { userPool} from "./amplify"

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
export const api = new aws.apigateway.RestApi("api", {
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
},{
    dependsOn: [itemsResource]
}
);


// GET /item/{id}
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
},{
    dependsOn: [itemResource]
});

const deleteIntegration = new aws.apigateway.Integration("delete-integration", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "DELETE",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: deleteItemFunction.invokeArn,
},{
    dependsOn: [itemResource]
});


const putIntegration = new aws.apigateway.Integration("put-integration", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "PUT",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: updateItemFunction.invokeArn,
},{
    dependsOn: [itemResource]
});

// Create the authorizer for the API Gateway
const apiAuthorizer = new aws.apigateway.Authorizer("api-authorizer", {
    restApi: api.id,
    name: "cognito-authorizer",
    type: "COGNITO_USER_POOLS",
    identitySource: "method.request.header.Authorization",
    providerArns: [userPool.arn],
});

// Update your API methods to use the authorizer
const createMethod = new aws.apigateway.Method("create-method", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "POST",
    authorization: "COGNITO_USER_POOLS",
    authorizerId: apiAuthorizer.id,
    authorizationScopes: [
        "aws.cognito.signin.user.admin"
    ],
    requestParameters: {
        "method.request.header.Authorization": true
    }
});

// Example for POST method (repeat similar pattern for other methods)
const createMethodResponse = new aws.apigateway.MethodResponse("create-method-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "POST",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
});

const createIntegrationResponse = new aws.apigateway.IntegrationResponse("create-integration-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "POST",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": "'http://localhost:3000'",
    },
});


const getMethod = new aws.apigateway.Method("get-method", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "GET",
    authorization: "COGNITO_USER_POOLS",
    authorizerId: apiAuthorizer.id,
    authorizationScopes: [
        "aws.cognito.signin.user.admin"
    ],
    requestParameters: {
        "method.request.header.Authorization": true
    }
});

// Example for POST method (repeat similar pattern for other methods)
const getMethodResponse = new aws.apigateway.MethodResponse("get-method-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "GET",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
});

const getIntegrationResponse = new aws.apigateway.IntegrationResponse("get-integration-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "GET",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": "'http://localhost:3000'",
    },
});

const updateMethod = new aws.apigateway.Method("update-method", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "PUT",
    authorization: "COGNITO_USER_POOLS",
    authorizerId: apiAuthorizer.id,
    authorizationScopes: [
        "aws.cognito.signin.user.admin"
    ],
    requestParameters: {
        "method.request.header.Authorization": true
    }
});

// Example for POST method (repeat similar pattern for other methods)
const updateMethodResponse = new aws.apigateway.MethodResponse("update-method-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "PUT",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
});

const updateIntegrationResponse = new aws.apigateway.IntegrationResponse("update-integration-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "PUT",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": "'http://localhost:3000'",
    },
});


const deleteMethod = new aws.apigateway.Method("delete-method", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "DELETE",
    authorization: "COGNITO_USER_POOLS",
    authorizerId: apiAuthorizer.id,
    authorizationScopes: [
        "aws.cognito.signin.user.admin"
    ],
    requestParameters: {
        "method.request.header.Authorization": true
    }
});

// Example for POST method (repeat similar pattern for other methods)
const deleteMethodResponse = new aws.apigateway.MethodResponse("delete-method-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "DELETE",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
});

const deleteIntegrationResponse = new aws.apigateway.IntegrationResponse("delete-integration-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "DELETE",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": "'http://localhost:3000'",
    },
});

// Update CORS options to include Authorization header
const corsOptions = new aws.apigateway.Method("cors-options", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "OPTIONS",
    authorization: "NONE",
    requestParameters: {
        "method.request.header.Access-Control-Allow-Headers": true,
        "method.request.header.Access-Control-Allow-Methods": true,
        "method.request.header.Access-Control-Allow-Origin": true,
    },
});

// Add CORS integration response
const corsIntegration = new aws.apigateway.Integration("cors-integration", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "OPTIONS",
    type: "MOCK",
    requestTemplates: {
        "application/json": `{"statusCode": 200}`
    },
},{
    dependsOn: [itemsResource]
});

const corsMethodResponse = new aws.apigateway.MethodResponse("cors-method-response", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "OPTIONS",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true,
        "method.response.header.Access-Control-Allow-Origin": true,
    },
    responseModels: {
        "application/json": "Empty",
    },
});

const corsIntegrationResponse = new aws.apigateway.IntegrationResponse("cors-integration-response", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "OPTIONS",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE'",
        "method.response.header.Access-Control-Allow-Origin": "'http://localhost:3000'",
    },
    responseTemplates: {
        "application/json": "",
    },
},{
    dependsOn: [itemsResource]
});

// Add CORS for the /items resource
const itemsResourceCors = new aws.apigateway.Method("items-cors-options", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "OPTIONS",
    authorization: "NONE",
    requestParameters: {
        "method.request.header.Access-Control-Allow-Headers": true,
        "method.request.header.Access-Control-Allow-Methods": true,
        "method.request.header.Access-Control-Allow-Origin": true,
    },
});

const itemsResourceCorsIntegration = new aws.apigateway.Integration("items-cors-integration", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "OPTIONS",
    type: "MOCK",
    requestTemplates: {
        "application/json": `{"statusCode": 200}`
    },
});

const itemsResourceCorsMethodResponse = new aws.apigateway.MethodResponse("items-cors-method-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "OPTIONS",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true,
        "method.response.header.Access-Control-Allow-Origin": true,
    },
    responseModels: {
        "application/json": "Empty",
    },
});

const itemsResourceCorsIntegrationResponse = new aws.apigateway.IntegrationResponse("items-cors-integration-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "OPTIONS",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST,GET,PUT,DELETE'",
        "method.response.header.Access-Control-Allow-Origin": "'http://localhost:3000'",
    },
});

// Deploy the API
const deployment = new aws.apigateway.Deployment("api-deployment", {
    restApi: api.id,},{
    dependsOn:[
        createMethod,
        getMethod,
        updateMethod,
        deleteMethod,
        corsOptions,
        corsIntegration,
        corsMethodResponse,
        corsIntegrationResponse,
        itemsResourceCorsIntegrationResponse,
        createIntegration,
        getIntegration,
        deleteIntegration,
        putIntegration,
        createItemFunction,
        getItemFunction,
        updateItemFunction,
        deleteItemFunction
    ],
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
