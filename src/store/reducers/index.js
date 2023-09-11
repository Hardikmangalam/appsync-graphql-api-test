/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from '../../utils/history';
// import languageProviderReducer from '../../containers/LanguageProvider';
import loginReducer from './login';
import errorReducer from './error';
import hostUIReducer from './host-ui';
import appReducer from './app';
// import registrationFormReducer from './registrationForm';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
export default function createReducer(injectedReducers = {}) {
  const rootReducer = combineReducers({
    // language: languageProviderReducer,
    logIn: loginReducer,
    hostUI: hostUIReducer,
    app: appReducer,
    error: errorReducer,
    // registrationForm: registrationFormReducer,
    router: connectRouter(history),
    ...injectedReducers,
  });

  return rootReducer;
}
