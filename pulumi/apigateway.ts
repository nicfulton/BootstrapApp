import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cognito from "./cognito";
import * as lambda from "./lambda";
import * as amplify from "./amplify";

const env = pulumi.getStack();


// Create API Gateway
export const api = new aws.apigateway.RestApi("api", {
    description: "API Gateway with Lambda and DynamoDB",
    apiKeySource: "HEADER",
    // endpointConfiguration: {
    //   types: "EDGE",
    // },
    name: `${env}-rest-api`,
    tags: { STAGE: env },
});

// Assuming you have your API Gateway reference as 'api'
const apiInvokePolicy = new aws.iam.Policy("apiInvokePolicy", {
    description: "Policy to allow invoking API Gateway endpoints",
    policy: {
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: [
                "execute-api:Invoke"
            ],
            Resource: [
                pulumi.interpolate`arn:aws:execute-api:${aws.getRegion().then(r => r.name)}:${aws.getCallerIdentity().then(i => i.accountId)}:${api.id}/*`
            ]
        }]
    }
});

const cognitoAuthRole = cognito.authenticatedRole;

// Attach this policy to your Cognito authenticated role
const cognitoAuthRolePolicyAttachment = new aws.iam.RolePolicyAttachment("cognitoAuthRolePolicyAttachment", {
    role: cognitoAuthRole.name,  // Reference to your authenticated role
    policyArn: apiInvokePolicy.arn
});

// Create the authorizer for the API Gateway
const apiAuthorizer = new aws.apigateway.Authorizer("api-authorizer", {
    restApi: api.id,
    name: `${env}-cognito-authorizer`,
    type: "COGNITO_USER_POOLS",
    identitySource: "method.request.header.Authorization",
    providerArns: [cognito.userPool.arn],
});


// Create API Gateway resources and methods
const itemsResource = new aws.apigateway.Resource("items", {
    restApi: api.id,
    parentId: api.rootResourceId,
    pathPart: "items",
});

// POST /items
export const createIntegration = new aws.apigateway.Integration("create-integration", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "POST",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: lambda.createItemFunction.invokeArn,
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

export const getIntegration = new aws.apigateway.Integration("get-integration", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "GET",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: lambda.getItemFunction.invokeArn,
},{
    dependsOn: [itemResource]
});

export const deleteIntegration = new aws.apigateway.Integration("delete-integration", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "DELETE",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: lambda.deleteItemFunction.invokeArn,
},{
    dependsOn: [itemResource]
});

export const putIntegration = new aws.apigateway.Integration("put-integration", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "PUT",
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: lambda.updateItemFunction.invokeArn,
},{
    dependsOn: [itemResource]
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

// Deploy the API
const deployment = new aws.apigateway.Deployment("api-deployment", {
    restApi: api.id,},{
    dependsOn:[
        createMethod,
        getMethod,
        updateMethod,
        deleteMethod,
        createIntegration,
        getIntegration,
        deleteIntegration,
        putIntegration
    ],
});

export const stage = new aws.apigateway.Stage("api-stage", {
    deployment: deployment.id,
    restApi: api.id,
    stageName: "dev",
});



// Export values
export const apiUrl = pulumi.interpolate`${stage.invokeUrl}`;
export const itemResourceObject = itemResource;
export const itemsResourceObject = itemsResource;