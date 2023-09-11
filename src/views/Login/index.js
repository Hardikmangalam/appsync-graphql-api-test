import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
// import Preview from '../Survey/Preview';
import Login from './Login';
import ModeratorLogin from './ModeratorLogin';
import Observer from './Observer';
// import WaitingScreen from '../../views/waitingScreen';

const LoginView = () => {
  return (
    <BrowserRouter basename="/login">
      <Switch>
        <>
          <Route exact path="/moderator" component={ModeratorLogin} />
          <Route exact path="/observer" component={Observer} />
          <Route exact path="/participant" component={Observer} />
          {/* <Route path="/user-survey/:id" component={Preview} /> */}
          {/* <Route path="/waitingscreen" exact component={WaitingScreen} /> */}
          <Route exact path="/" component={Login} />
        </>
      </Switch>
    </BrowserRouter>
  );
};

export default LoginView;
