import React, { Component, PropTypes } from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router'

class DefaultPage extends Component {
  constructor(props){
    super(props);
  }

  componentWillMount(){
    if (!Meteor.userId() ) {
      if(Meteor.settings.public.disable_auth===true){

      }else {
        console.log("push to login in will mount")
        browserHistory.push('/login');
      }
    }
  }

  componentDidUpdate(prevProps, prevState){
    if (!Meteor.userId() || !this.props.userReady) {
      console.log("push to login in did update")
      browserHistory.push('/login');
    }
  }
  render(){
      if(Meteor.settings.public.disable_auth || this.props.userReady){
          var serviceData = Meteor.user() ? Meteor.user().services : {};
          var authorized = this.isAuthorized(serviceData);
          if(authorized) {
            return (
              <div>
                {this.props.children}
              </div>
            );
          }else {
            return(<div>Not authorized</div>)
          }
      }else{
        return(
          <div>
            Loading and authorize
          </div>
        );
      }
  }

  isAuthorized(services){
    var authorized =false
    if(Meteor.settings.public.disable_auth ===true ) {
      authorized = true
    }else {
      if (services && services.oidc && services.oidc.realm_access) {
        var roles = services.oidc.realm_access.roles
        console.log("role: " + roles);
        authorized = roles.includes('pulp_admin')
      }
    }
    return authorized
  }
}
export default DefaultContainer = createContainer(() => {
  if(Meteor.settings.public.disable_auth === false ) {
    var userSub = Meteor.subscribe("userData");
    return {
      userReady: userSub.ready() ? (Meteor.user() ? true : false) : false
    }
  }else {
    return {
      userReady : true
    }
  }
}, DefaultPage);