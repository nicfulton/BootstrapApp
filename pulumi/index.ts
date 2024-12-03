import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import * as amplify from "./amplify"
import * as apigateway from "./apigateway"
import * as cognito from "./cognito"
import * as lambda from "./lambda"
import * as dynamodb from "./dynamodb"
import * as apigateway_cors from "./apigateway_cors"

import { EnvironmentWriter } from "./config/environment";

const infra = {
  cognito,
  dynamodb,
  lambda,
  apigateway,
  amplify,
  apigateway_cors
}

/*
REACT_APP_USER_POOL_ID="ap-southeast-2_Z84UHftys"
REACT_APP_USER_POOL_CLIENT_ID="63cr6u8h2alm98jqmk4dicubl4"
REACT_APP_IDENTITY_POOL_ID="ap-southeast-2:dca64e96-50ce-4f14-98c7-536ce8d4ca6b"
REACT_APP_AWS_REGION="ap-southeast-2"
*/

// Configure environment variables
const envConfig = {
  USER_POOL_ID: infra.cognito.userPool.id,
  USER_POOL_CLIENT_ID: infra.cognito.userPoolClient.id,
  REGION: pulumi.output("ap-southeast-2"),
  IDENTITY_POOL_ID: infra.cognito.identityPool.id,
  API_URL: infra.apigateway.apiUrl,//pulumi.interpolate`${api.executionArn}/*/`,
  STAGE_NAME: pulumi.output("dev"),
};

const envPaths = [
  '../front-end/.env.development',
  '../front-end/.env.production',
  '../front-end/.env.local'
];

const envWriter = new EnvironmentWriter(envConfig, envPaths);

// Write environment files
export const environmentVariables = envWriter.writeEnvFiles();
/*
// You can also add stack-specific configurations
const config = new pulumi.Config();
const stackName = pulumi.getStack();

if (stackName === "dev") {
  envConfig.API_URL = pulumi.interpolate`${api.executeApiArn}/dev`;
} else if (stackName === "prod") {
  envConfig.API_URL = pulumi.interpolate`${api.executeApiArn}/prod`;
}

// Add validation for required values
const validateOutputs = pulumi.all([
  userPool.id,
  userPoolClient.id,
  api.executeApiArn
]).apply(([poolId, clientId, apiUrl]) => {
  if (!poolId) throw new Error("User Pool ID is required");
  if (!clientId) throw new Error("User Pool Client ID is required");
  if (!apiUrl) throw new Error("API URL is required");
  return true;
});
*/
// Example of how to use the environment variables in your React app:
// front-end/.env.development