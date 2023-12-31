import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import Amplify from 'aws-amplify';
import config from './aws-exports';
import { getSecureSessionData } from './graphqlOperations/encryprWrapper';
Amplify.configure({
  ...config,
  API: {
    graphql_headers: async () => ({
      'x-auth-provider': getSecureSessionData('token') || 'XXXX',
    }),
  },
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install(); // eslint-disable-line global-require
}
