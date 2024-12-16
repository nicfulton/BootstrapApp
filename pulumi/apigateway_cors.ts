import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "./apigateway"
import * as amplify from "./amplify"
import { TrustProvider } from "@pulumi/aws/verifiedaccess/trustProvider";


const itemResource = apigateway.itemResourceObject;
const itemsResource = apigateway.itemsResourceObject;
const createIntegration = apigateway.createIntegration;
const getIntegration = apigateway.getIntegration;
const deleteIntegration = apigateway.deleteIntegration;
const updateIntegration = apigateway.putIntegration;
const api = apigateway.api;

const env = pulumi.getStack();
// ----------------------- CORS -----------------------
export const corsResource = new aws.apigateway.Resource(
    "cors",
    {
      restApi: api.id,
      parentId: api.rootResourceId,
      pathPart: "{cors+}",
    },

  );
  export const corsMethod = new aws.apigateway.Method(
    "cors",
    {
      restApi: api.id,
      resourceId: corsResource.id,
      httpMethod: "OPTIONS",
      authorization: "NONE",
      apiKeyRequired: false
    },
    
  );
  export const corsIntegration = new aws.apigateway.Integration(
    "cors",
    {
      restApi: api.id,
      resourceId: corsResource.id,
      httpMethod: corsMethod.httpMethod,
      type: "MOCK",
      // passthroughBehavior: "NEVER",
      requestTemplates: {
        "application/json": `{"statusCode":200}`,
      },
    },

  );
  export const corsMethodResponse = new aws.apigateway.MethodResponse(
    "cors",
    {
      restApi: api.id,
      resourceId: corsResource.id,
      httpMethod: corsMethod.httpMethod,
      statusCode: "200",
      responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
        "method.response.header.Access-Control-Allow-Methods": true,
        "method.response.header.Access-Control-Allow-Headers": true,
      },
      responseModels: {
        "application/json": "Empty",
      },
    },
    { dependsOn: [corsMethod] }
  );

  export const corsIntegrationResponse = new aws.apigateway.IntegrationResponse(
    "cors",
    {
      restApi: api.id,
      resourceId: corsResource.id,
      httpMethod: corsMethod.httpMethod,
      statusCode: "200",
      responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": `'$util.escapeJavaScript($input.params('Origin'))'`, // amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://master.${domain}'`),
        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization", //,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        "method.response.header.Access-Control-Allow-Methods": "'GET, POST, PUT, DELETE, OPTIONS'", // Add more methods as needed
      },
      responseTemplates: {
          "application/json": ""
      }
    },
    { dependsOn: [corsIntegration, corsMethodResponse, api] }
  );

 export const defaultResponse4xx = new aws.apigateway.Response(
    "response-4xx",
    {
      restApiId: api.id,
      responseType: "DEFAULT_4XX",
      responseTemplates: {
        "application/json": "{'message':$context.error.messageString}",
      },
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": `'$util.escapeJavaScript($input.params('Origin'))'`, //amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://master.${domain}'`),
      },
    },
    { 
        dependsOn: [amplify.app]
     }
  );
  
  export const defaultResponse5xx = new aws.apigateway.Response(
    "response-5xx",
    {
      restApiId: api.id,
      responseType: "DEFAULT_5XX",
      responseTemplates: {
        "application/json": "{'message':$context.error.messageString}",
      },
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": `'$util.escapeJavaScript($input.params('Origin'))'`, //amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://master.${domain}'`),
      },
    },
    { 
        dependsOn: [amplify.app]
     }
  );


if(TrustProvider){
//const amplifyUrl = amplify.defaultDomain.apply(domain => `${domain}/dev`);
// amplify.defaultDomain.apply(domain => `http://localhost:3000, https://master.${domain}`)

//const hostString = "'http://localhost:3000','"+amplifyUrl+"'";
// console.log("first",amplify.defaultDomain.apply(domain => `"http://localhost:3000, https://master.${domain}"`));
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
        "method.response.header.Access-Control-Allow-Origin": `'$util.escapeJavaScript($input.params('Origin'))'`, //amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://master.${domain}'`),
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
        "method.response.header.Access-Control-Allow-Origin": `'$util.escapeJavaScript($input.params('Origin'))'`, //amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://master.${domain}'`),
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
        "method.response.header.Access-Control-Allow-Origin": `'$util.escapeJavaScript($input.params('Origin'))'`, //amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://master.${domain}'`),
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
        "method.response.header.Access-Control-Allow-Origin": `'$util.escapeJavaScript($input.params('Origin'))'`, //amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://master.${domain}'`),
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
        "method.response.header.Access-Control-Allow-Origin": `'$util.escapeJavaScript($input.params('Origin'))'`, //amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://master.${domain}'`),
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
        "method.response.header.Access-Control-Allow-Origin": `'$util.escapeJavaScript($input.params('Origin'))'`, //amplify.defaultDomain.apply(domain => `'http://localhost:3000, https://master.${domain}'`),
    },
},{
    dependsOn: [itemsResource,api]
});

}
