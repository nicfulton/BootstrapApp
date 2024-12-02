const amplifyConfig = {
    Auth: {
        Cognito: {
            userPoolId: process.env.REACT_APP_USER_POOL_ID,
            userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
            identitypoolid: process.env.REACT_APP_IDENTITY_POOL_ID,
            region: process.env.REACT_APP_AWS_REGION,
            signUpVerificationMethod: 'code'
        }
    },
    API: {
        REST: {
          api: {
            endpoint: process.env.REACT_APP_API_URL,
            region: process.env.REACT_APP_REGION,
            defaultAuthMode: 'userPool'
          }
        }
      }
};


console.log(amplifyConfig);

export default amplifyConfig;
