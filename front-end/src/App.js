import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import amplifyConfig from './amplifyconfiguration';

Amplify.configure(amplifyConfig);

function App({ signOut, user }) {
  return (
    <div>
      <h1>Hello {user.username}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

export default withAuthenticator(App);