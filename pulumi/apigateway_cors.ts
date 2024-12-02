import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "./apigateway"
import * as amplify from "./amplify"

const hostString = "'http://localhost:3000','"+amplify.app.defaultDomain+"'";

// CORS for create
const createMethodResponse = new aws.apigateway.MethodResponse("create-method-response", {
    restApi: apigateway.api.id,
    resourceId: apigateway.itemsResource.id,
    httpMethod: "POST",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
});

const createIntegrationResponse = new aws.apigateway.IntegrationResponse("create-integration-response", {
    restApi: apigateway.api.id,
    resourceId: apigateway.itemsResource.id,
    httpMethod: "POST",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
});

// CORS for get
const getMethodResponse = new aws.apigateway.MethodResponse("get-method-response", {
    restApi: apigateway.api.id,
    resourceId: apigateway.itemsResource.id,
    httpMethod: "GET",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
});

const getIntegrationResponse = new aws.apigateway.IntegrationResponse("get-integration-response", {
    restApi: apigateway.api.id,
    resourceId: apigateway.itemsResource.id,
    httpMethod: "GET",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
});

// CORS for update
const updateMethodResponse = new aws.apigateway.MethodResponse("update-method-response", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
    httpMethod: "PUT",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
});

const updateIntegrationResponse = new aws.apigateway.IntegrationResponse("update-integration-response", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
    httpMethod: "PUT",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
});

// CORS for delete 
const deleteMethodResponse = new aws.apigateway.MethodResponse("delete-method-response", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
    httpMethod: "DELETE",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
});

const deleteIntegrationResponse = new aws.apigateway.IntegrationResponse("delete-integration-response", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
    httpMethod: "DELETE",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
});

// Update CORS options to include Authorization header
const itemCorsOptions = new aws.apigateway.Method("cors-options", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
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
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
    httpMethod: "OPTIONS",
    type: "MOCK",
    requestTemplates: {
        "application/json": `{"statusCode": 200}`
    },
},{
    dependsOn: [apigateway.itemResource]
});

const itemCorsMethodResponse = new aws.apigateway.MethodResponse("cors-method-response", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
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

const itemCorsIntegrationResponse = new aws.apigateway.IntegrationResponse("cors-integration-response", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
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
    dependsOn: [apigateway.itemResource]
});

// Add CORS for the /items resource
const itemsCorsMethod = new aws.apigateway.Method("items-cors-options", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
    httpMethod: "OPTIONS",
    authorization: "NONE",
    requestParameters: {
        "method.request.header.Access-Control-Allow-Headers": true,
        "method.request.header.Access-Control-Allow-Methods": true,
        "method.request.header.Access-Control-Allow-Origin": true,
    },
});

const itemsCorsIntegration = new aws.apigateway.Integration("items-cors-integration", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
    httpMethod: "OPTIONS",
    type: "MOCK",
    requestTemplates: {
        "application/json": `{"statusCode": 200}`
    },
});

const itemsCorsMethodResponse = new aws.apigateway.MethodResponse("items-cors-method-response", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
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

const itemsCorsIntegrationResponse = new aws.apigateway.IntegrationResponse("items-cors-integration-response", {
    restApi:apigateway.api.id,
    resourceId:apigateway.itemResource.id,
    httpMethod: "OPTIONS",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST,GET,PUT,DELETE'",
        "method.response.header.Access-Control-Allow-Origin": hostString,
    },
});

