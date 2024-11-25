
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create Cognito User Pool
const userPool = new aws.cognito.UserPool("app-user-pool", {
    name: "app-user-pool",
    passwordPolicy: {
        minimumLength: 8,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
    },
    autoVerifiedAttributes: ["email"],
    accountRecoverySetting: {
        recoveryMechanisms: [
            {
                name: "verified_email",
                priority: 1,
            },
        ],
    },
    schemas: [
        {
            attributeDataType: "String",
            name: "email",
            required: true,
            mutable: true,
            stringAttributeConstraints: {
                minLength: "0",
                maxLength: "2048",
            },
        },
    ],
});

// Create User Pool Client
const userPoolClient = new aws.cognito.UserPoolClient("app-user-pool-client", {
    userPoolId: userPool.id,
    generateSecret: false,
    preventUserExistenceErrors: "ENABLED",
    explicitAuthFlows: [
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
        "ALLOW_USER_PASSWORD_AUTH",
    ],
});

// Create Identity Pool
const identityPool = new aws.cognito.IdentityPool("app-identity-pool", {
    identityPoolName: "app_identity_pool",
    allowUnauthenticatedIdentities: false,
    cognitoIdentityProviders: [{
        clientId: userPoolClient.id,
        providerName: userPool.endpoint,
        serverSideTokenCheck: false,
    }],
});

// Create IAM roles for authenticated and unauthenticated users
const authenticatedRole = new aws.iam.Role("authenticatedRole", {
    assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: {
                Federated: "cognito-identity.amazonaws.com"
            },
            Action: "sts:AssumeRoleWithWebIdentity",
            Condition: {
                StringEquals: {
                    "cognito-identity.amazonaws.com:aud": identityPool.id
                },
                "ForAnyValue:StringLike": {
                    "cognito-identity.amazonaws.com:amr": "authenticated"
                }
            }
        }]
    }
});

// Attach basic authenticated user policy
new aws.iam.RolePolicy("authenticatedRolePolicy", {
    role: authenticatedRole.id,
    policy: {
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: [
                "mobileanalytics:PutEvents",
                "cognito-sync:*",
                "cognito-identity:*"
            ],
            Resource: ["*"]
        }]
    }
});

// Create Identity Pool Role Attachment
new aws.cognito.IdentityPoolRoleAttachment("identity-pool-role-attachment", {
    identityPoolId: identityPool.id,
    roles: {
        authenticated: authenticatedRole.arn,
    },
});

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.BucketV2("my-bucket");

// Create a new Amplify app
const app = new aws.amplify.App("react-app", {
    name: "react-application",
    repository: "https://github.com/nicfulton/BootstrapApp",
    accessToken: process.env.GITHUB_ACCESS_TOKEN,
    enableAutoBranchCreation: true,
    enableBranchAutoBuild: true,
    buildSpec: `version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - cd front-end
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: front-end/build
        files:
          - '**/*'
      cache:
        paths:
          - front-end/node_modules/**/*`,
    environmentVariables: {
        AMPLIFY_MONOREPO_APP_ROOT: "front-end/src",
        NODE_ENV: "production",
        // Add Cognito configuration
        REACT_APP_USER_POOL_ID: userPool.id,
        REACT_APP_USER_POOL_CLIENT_ID: userPoolClient.id,
        REACT_APP_IDENTITY_POOL_ID: identityPool.id,
        REACT_APP_AWS_REGION: process.env.AWS_REGION || "ap-southeast-2",
    },
});


// Create a branch
const branch = new aws.amplify.Branch("main", {
    appId: app.id,
    branchName: "main",
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
export const userPoolId = userPool.id;
export const userPoolClientId = userPoolClient.id;
export const identityPoolId = identityPool.id;


