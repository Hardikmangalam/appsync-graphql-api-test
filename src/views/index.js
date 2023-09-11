// export { default as Dashboard } from './dashboard';
// export { default as HostView } from './HostView';
// export { default as LoginView } from './Login';

import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import Login from './Login/Login';
import ModeratorLogin from './Login/ModeratorLogin';
import Observer from './Login/Observer';
import Speaker from './Vizart';
const LoginView = props => {
  return (
    <BrowserRouter basename="/login">
      <Switch>
        <Route exact path="/" props={props} component={Login} />
        <Route exact path="/moderator" component={ModeratorLogin} />
        <Route exact path="/observer" component={Observer} />
        <Route exact path="/speaker" component={Speaker} />
      </Switch>
    </BrowserRouter>
  );
};

export default LoginView;
