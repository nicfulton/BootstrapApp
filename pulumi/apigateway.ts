import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cognito from "./cognito";
import * as lambda from "./lambda";
import * as amplify from "./amplify";

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

// Create the authorizer for the API Gateway
const apiAuthorizer = new aws.apigateway.Authorizer("api-authorizer", {
    restApi: api.id,
    name: "cognito-authorizer",
    type: "COGNITO_USER_POOLS",
    identitySource: "method.request.header.Authorization",
    providerArns: [cognito.userPool.arn],
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

if(false){
    
    const amplifyUrl = amplify.defaultDomain.apply(domain => `${domain}/dev`);

    const hostString = "'http://localhost:3000','"+amplifyUrl+"'";
    console.log("second",hostString);

// CORS for create
const createMethodResponse = new aws.apigateway.MethodResponse("create-method-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "POST",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
},{
    dependsOn: [itemsResource]
});

const createIntegrationResponse = new aws.apigateway.IntegrationResponse("create-integration-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "POST",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
},{
    dependsOn: [itemsResource]
});

// CORS for get
const getMethodResponse = new aws.apigateway.MethodResponse("get-method-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "GET",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
},{
    dependsOn: [itemsResource]
});

const getIntegrationResponse = new aws.apigateway.IntegrationResponse("get-integration-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "GET",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
},{
    dependsOn: [itemsResource]
});

// CORS for update
const updateMethodResponse = new aws.apigateway.MethodResponse("update-method-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "PUT",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
},{
    dependsOn: [itemResource]
});

const updateIntegrationResponse = new aws.apigateway.IntegrationResponse("update-integration-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "PUT",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
},{
    dependsOn: [itemResource]
});

// CORS for delete 
const deleteMethodResponse = new aws.apigateway.MethodResponse("delete-method-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "DELETE",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
},{
    dependsOn: [itemResource]
});

const deleteIntegrationResponse = new aws.apigateway.IntegrationResponse("delete-integration-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "DELETE",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
},{
    dependsOn: [itemResource]
});

// Update CORS options to include Authorization header
const itemCorsOptions = new aws.apigateway.Method("cors-options", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "OPTIONS",
    authorization: "NONE",
    requestParameters: {
        "method.request.header.Access-Control-Allow-Headers": true,
        "method.request.header.Access-Control-Allow-Methods": true,
        "method.request.header.Access-Control-Allow-Origin": true,
    },
});

// Add CORS integration response
const itemCorsIntegration = new aws.apigateway.Integration("cors-integration", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "OPTIONS",
    type: "MOCK",
    requestTemplates: {
        "application/json": `{"statusCode": 200}`
    },
},{
    dependsOn: [itemResource]
});

const itemCorsMethodResponse = new aws.apigateway.MethodResponse("cors-method-response", {
    restApi:api.id,
    resourceId:itemResource.id,
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
},{
    dependsOn: [itemResource]
});

const itemCorsIntegrationResponse = new aws.apigateway.IntegrationResponse("cors-integration-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "OPTIONS",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE'",
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
    responseTemplates: {
        "application/json": "",
    },
},{
    dependsOn: [itemResource]
});

// Add CORS for the /items resource
const itemsCorsMethod = new aws.apigateway.Method("items-cors-options", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "OPTIONS",
    authorization: "NONE",
    requestParameters: {
        "method.request.header.Access-Control-Allow-Headers": true,
        "method.request.header.Access-Control-Allow-Methods": true,
        "method.request.header.Access-Control-Allow-Origin": true,
    },
});

const itemsCorsIntegration = new aws.apigateway.Integration("items-cors-integration", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "OPTIONS",
    type: "MOCK",
    requestTemplates: {
        "application/json": `{"statusCode": 200}`
    },
});

const itemsCorsMethodResponse = new aws.apigateway.MethodResponse("items-cors-method-response", {
    restApi:api.id,
    resourceId:itemResource.id,
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
},{
    dependsOn: [itemResource]
});

const itemsCorsIntegrationResponse = new aws.apigateway.IntegrationResponse("items-cors-integration-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "OPTIONS",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST,GET,PUT,DELETE'",
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
},{
    dependsOn: [itemResource]
});



}

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


// Grant Lambda permissions to API Gateway
const createPermission = new aws.lambda.Permission("create-permission", {
    action: "lambda:InvokeFunction",
    function: lambda.createItemFunction.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*`,
});

const getPermission = new aws.lambda.Permission("get-permission", {
    action: "lambda:InvokeFunction",
    function: lambda.getItemFunction.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*`,
});

const updatePermission = new aws.lambda.Permission("update-permission", {
    action: "lambda:InvokeFunction",
    function: lambda.updateItemFunction.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*`,
});

const deletePermission = new aws.lambda.Permission("delete-permission", {
    action: "lambda:InvokeFunction",
    function: lambda.deleteItemFunction.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*`,
});

// Export values
export const apiUrl = pulumi.interpolate`${stage.invokeUrl}`;
export const itemResourceObject = itemResource;
export const itemsResourceObject = itemsResource;