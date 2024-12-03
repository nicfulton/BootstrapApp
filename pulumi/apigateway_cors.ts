import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "./apigateway"
import * as amplify from "./amplify"


const itemResource = apigateway.itemResourceObject;
const itemsResource = apigateway.itemsResourceObject;
const createIntegration = apigateway.createIntegration;
const getIntegration = apigateway.getIntegration;
const deleteIntegration = apigateway.deleteIntegration;
const updateIntegration = apigateway.putIntegration;
const api = apigateway.api;


if(true){
//const amplifyUrl = amplify.defaultDomain.apply(domain => `${domain}/dev`);
// amplify.defaultDomain.apply(domain => `http://localhost:3000, https://${domain}/dev`)

//const hostString = "'http://localhost:3000','"+amplifyUrl+"'";
console.log("first",amplify.defaultDomain.apply(domain => `"http://localhost:3000, https://${domain}/dev"`));
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
    dependsOn: [createIntegration]
});

const createIntegrationResponse = new aws.apigateway.IntegrationResponse("create-integration-response", {
    restApi: api.id,
    resourceId: itemsResource.id,
    httpMethod: "POST",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://${domain}/dev'`),
    },
},{
    dependsOn: [itemsResource,api]
});

// CORS for get
const getMethodResponse = new aws.apigateway.MethodResponse("get-method-response", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "GET",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
    },
},{
    dependsOn: [itemResource,getIntegration,api]
});

const getIntegrationResponse = new aws.apigateway.IntegrationResponse("get-integration-response", {
    restApi: api.id,
    resourceId: itemResource.id,
    httpMethod: "GET",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://${domain}/dev'`),
    },
},{
    dependsOn: [itemsResource, api]
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
    dependsOn: [updateIntegration]
});

const updateIntegrationResponse = new aws.apigateway.IntegrationResponse("update-integration-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "PUT",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://${domain}/dev'`),
    },
},{
    dependsOn: [itemsResource,api]
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
    dependsOn: [deleteIntegration]
});

const deleteIntegrationResponse = new aws.apigateway.IntegrationResponse("delete-integration-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "DELETE",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://${domain}/dev'`),
    },
},{
    dependsOn: [itemsResource,api]
});

// Update CORS options to include Authorization header
const itemCorsOptions = new aws.apigateway.Method("item-cors-options", {
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
const itemCorsIntegration = new aws.apigateway.Integration("item-cors-integration", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "OPTIONS",
    type: "MOCK",
    requestTemplates: {
        "application/json": `{"statusCode": 200}`
    },
},{
    dependsOn: [itemCorsOptions]
});

const itemCorsMethodResponse = new aws.apigateway.MethodResponse("item-cors-method-response", {
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
    dependsOn: [itemCorsIntegration]
});

const itemCorsIntegrationResponse = new aws.apigateway.IntegrationResponse("cors-integration-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "OPTIONS",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE'",
        "method.response.header.Access-Control-Allow-Origin": amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://${domain}/dev'`),
    },
    responseTemplates: {
        "application/json": "",
    },
},{
    dependsOn: [itemsResource,api]
});

// Add CORS for the /items resource
const itemsCorsMethod = new aws.apigateway.Method("items-cors-options", {
    restApi:api.id,
    resourceId:itemsResource.id,
    httpMethod: "OPTIONS",
    authorization: "NONE",
    requestParameters: {
        "method.request.header.Access-Control-Allow-Headers": true,
        "method.request.header.Access-Control-Allow-Methods": true,
        "method.request.header.Access-Control-Allow-Origin": true,
    },
});

// Add CORS integration response
const itemsCorsIntegration = new aws.apigateway.Integration("items-cors-integration", {
    restApi:api.id,
    resourceId:itemsResource.id,
    httpMethod: "OPTIONS",
    type: "MOCK",
    requestTemplates: {
        "application/json": `{"statusCode": 200}`
    },
},{
    dependsOn: [itemsCorsMethod]
});

const itemsCorsMethodResponse = new aws.apigateway.MethodResponse("items-cors-method-response", {
    restApi:api.id,
    resourceId:itemsResource.id,
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
    dependsOn: [itemsCorsIntegration]
});


const itemsCorsIntegrationResponse = new aws.apigateway.IntegrationResponse("items-cors-integration-response", {
    restApi:api.id,
    resourceId:itemResource.id,
    httpMethod: "OPTIONS",
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST,GET,PUT,DELETE'",
        "method.response.header.Access-Control-Allow-Origin": amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://${domain}/dev'`),
    },
},{
    dependsOn: [itemsResource,api]
});

}
