import React from 'react'
import { Router, Route, browserHistory, IndexRoute } from 'react-router'

// containers
import AppContainer from './App.jsx'
import DefaultContainer from './DefaultContainer'
import LoginContainer from './LoginPage'

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="login" component={LoginContainer}/>
    <Route path="/" component={DefaultContainer}>
      <IndexRoute component={AppContainer}/>
    </Route>
  </Router>
);