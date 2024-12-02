import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import amplifyConfig from './amplifyconfiguration';
import { fetchUserAttributes } from '@aws-amplify/auth';

// Material UI imports
import AppNavbar from './AppNavbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Add custom theme (optional)
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import ItemManager from './components/ItemManager.tsx';

Amplify.configure(amplifyConfig);
// Function to print access token and id token
const printUserAttributes = async () => {
  try {
    const userAttributes = await fetchUserAttributes();
    const email = userAttributes.email;
    const username= userAttributes['custom:FullName'];
    console.log("User attributes:", email, username);
  }
  catch (e) { console.log(e); }
};

function App({ signOut, user }) {
  console.log(user);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppNavbar user={user} signOut={signOut} />
      
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Dashboard
        </Typography>
        <Typography variant="body1">
          You are signed in as {user.username}
        </Typography>
        <button onClick={printUserAttributes}>Print Attributes</button>
        <ItemManager />
      </Box>
    </Box>
  );
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },  
});

// Wrap the app with ThemeProvider
function ThemedApp(props) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App {...props} />
    </ThemeProvider>
  );
}

export default withAuthenticator(ThemedApp, {
  signUpAttributes: ['email'],
  //socialProviders: ['amazon', 'apple', 'facebook', 'google'],
  variation: 'modal',
  formFields: {
    signUp: {
      email: {
        required: true,
        order: 1
      },
      password: {
        required: true,
        order: 2
      },
      confirm_password: {
        required: true,
        order: 3
      }
    }
  },
  services: {
    validateCustomSignUp: async (formData) => {
      if (!formData.email.includes('@')) {
        return {
          email: 'Please enter a valid email address'
        };
      }
      return {};
    }
  }
});
/*
export default withAuthenticator(App, {
  signUpAttributes: ['email', 'phone_number'],
  socialProviders: ['amazon', 'apple', 'facebook', 'google'],
  variation: 'modal'
});
export default withAuthenticator(App);
*/