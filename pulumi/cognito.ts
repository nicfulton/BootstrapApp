import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create Cognito User Pool
export const userPool = new aws.cognito.UserPool("app-user-pool", {
    name: "app-user-pool",
    passwordPolicy: {
        minimumLength: 8,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
    },
    // Email verification settings
    autoVerifiedAttributes: ["email"],
    emailVerificationMessage: "Your verification code is {####}",
    emailVerificationSubject: "Your verification code",
    
    // Email configuration
    emailConfiguration: {
        emailSendingAccount: "COGNITO_DEFAULT"
    },
    
    // Account recovery settings
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

    // Username attributes
    usernameAttributes: ["email"],

    // Username configuration
    usernameConfiguration: {
        caseSensitive: false,
    },
    
    // MFA configuration (optional)
    mfaConfiguration: "OFF",
    
    // Device tracking (optional)
    deviceConfiguration: {
        challengeRequiredOnNewDevice: true,
        deviceOnlyRememberedOnUserPrompt: true,
    }
});

// Create User Pool Client
export const userPoolClient = new aws.cognito.UserPoolClient("app-user-pool-client", {
    userPoolId: userPool.id,
    // No client secret for browser-based apps
    generateSecret: false,
    // Prevent user existence errors
    preventUserExistenceErrors: "ENABLED",
    // Authentication flows
    explicitAuthFlows: [
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
        "ALLOW_USER_PASSWORD_AUTH",
    ],
      
    // Token validity
    refreshTokenValidity: 30,
    accessTokenValidity: 1,
    idTokenValidity: 1,
    
    tokenValidityUnits: {
        refreshToken: "days",
        accessToken: "hours",
        idToken: "hours",
    },
    
    // Callback URLs (if needed)
    supportedIdentityProviders: ["COGNITO"],
    
    // OAuth settings (if needed)
    // allowedOauthFlows: ["code"],
    // allowedOauthScopes: ["email", "openid", "profile"],
    // allowedOauthFlowsUserPoolClient: true,
});

// Create Identity Pool
export const identityPool = new aws.cognito.IdentityPool("app-identity-pool", {
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
