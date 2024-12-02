
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cognito from "./cognito"
import * as apigateway from "./apigateway"

let config = new pulumi.Config();
let github = config.requireSecret("GITHUB_ACCESS_TOKEN")

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.BucketV2("my-bucket");

console.log("GIIHUB", github);

// Create a new Amplify app
const app = new aws.amplify.App("react-app", {
    name: "react-application",
    repository: "https://github.com/nicfulton/BootstrapApp",
//    accessToken: process.env.GITHUB_ACCESS_TOKEN,
    accessToken: github,
    enableAutoBranchCreation: true,
    enableBranchAutoBuild: true,
    buildSpec: `version: 1
applications:
  - appRoot: 'front-end/src'
    frontend:
      phases:
        preBuild:
          commands:
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: '../build'
        files:
          - '**/*'
      cache:
        paths:
          - '../node_modules/**/*'`
      ,
    environmentVariables: {
        AMPLIFY_MONOREPO_APP_ROOT: "front-end/src",
        NODE_ENV: "development",
        // Add Cognito configuration
        REACT_APP_USER_POOL_ID: cognito.userPool.id,
        REACT_APP_USER_POOL_CLIENT_ID: cognito.userPoolClient.id,
        REACT_APP_IDENTITY_POOL_ID: cognito.identityPool.id,
        REACT_APP_AWS_REGION: process.env.AWS_REGION || "ap-southeast-2",
        REACT_APP_API_URL: apigateway.apiUrl, // Replace with your actual API URL
    },
});


// Create a branch
const branch = new aws.amplify.Branch("master", {
    appId: app.id,
    branchName: "master",
    framework: "React",
    stage: "PRODUCTION",
    enableAutoBuild: true,
});

if(false){
// Create domain association if you have a custom domain
const domain = new aws.amplify.DomainAssociation("domain", {
    appId: app.id,
    domainName: "yourdomain.com",
    subDomains: [{
        branchName: branch.branchName,
        prefix: "",
    }],
});
}

// Export important values
export const bucketName = bucket.id;
export const defaultDomain = app.defaultDomain;
export const appId = app.id;


