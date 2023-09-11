import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import Routes from './Routes';
import history from './utils/history';
import configureStore from './store/configureStore';
import errorImg from './assets/images/picture.svg';
// // TODO to check if values are coming or not
// console.log(authenticatorConfig, 'authenticatorConfig'); // eslint-disable-line

const initialState = {};
const store = configureStore(initialState, history);

const App = () => {
  return (
    <ReduxProvider store={store}>
      {window.self !== window.top ? (
        <div>
          <div>
            <img
              src={errorImg}
              alt="errorImg"
              style={{ margin: '8rem auto auto auto', display: 'flex' }}
            />
          </div>
          <div style={{ marginTop: '4rem' }}>
            <h2 className="text-center">Oops...</h2>
            <p className="text-center">
              We can't seem to find the meeting you are looking for.{' '}
            </p>
          </div>
        </div>
      ) : (
        <Routes isAuth="false" />
      )}
    </ReduxProvider>
  );
};

export default App;
