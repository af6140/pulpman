import React, { Component, PropTypes } from 'react'
import { browserHistory, Link } from 'react-router'
import { createContainer } from 'meteor/react-meteor-data'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import ActionHome from 'material-ui/svg-icons/action/home';
import LoginButton from './LoginButton.jsx'

class LoginPage extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount(){
    console.log("logpage will mount")
    if (Meteor.user()) {
      browserHistory.push('/');
    }else {
      console.log("user not found in loginpage")
    }
  }
  componentDidUpdate(prevProps, prevState){
    console.log("logpage update")
    if (Meteor.user()) {
      browserHistory.push('/');
    }else {
      console.log("user not found in loginpage")
    }
  }
  render() {
    console.log("login page render");
    return (
      <MuiThemeProvider>
        <div className="container">
        <AppBar title="Pulp Man" iconElementLeft={< IconButton tooltip="Home"> <ActionHome/> </IconButton>}
               />
        <LoginButton />
        </div>
      </MuiThemeProvider>
    )
  }
}

export default LoginPageContainer = createContainer(() => {
  var userSub = Meteor.subscribe("userData");
  return{
    userReady: userSub.ready() ? (Meteor.user() ? true: false) : false
  }
}, LoginPage);