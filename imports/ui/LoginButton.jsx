import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { browserHistory, Link } from 'react-router'

export default class LoginButton extends Component {
  componentDidMount() {
    // Use Meteor Blaze to render login buttons
    Template.loginButtons.events(
      {
       'click #login-button': function() {
         Meteor.loginWithOidc({}, function (err) {
           if (err) {
             console.log(err.message);
           } else {
             console.log("logged in successful");
             browserHistory.push('/');
           }
         });
        }
      }
    );
    this.view = Blaze.render(Template.loginButtons,
      ReactDOM.findDOMNode(this.refs.loginButtonContainer));
  }
  componentWillUnmount() {
    // Clean up Blaze view
    Blaze.remove(this.view);
  }
  render() {
    // Just render a placeholder container that will be filled in
    return <span ref="loginButtonContainer" />;
  }
}