/*global PuppetModules RPMs*/
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Meteor} from 'meteor/meteor';
import {createContainer} from 'meteor/react-meteor-data';
import {Session} from 'meteor/session';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import ActionHome from 'material-ui/svg-icons/action/home';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import {Tracker} from 'meteor/tracker';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';


import {PuppetModules} from '../api/modules.js'
//PuppetModules = new Mongo.Collection('modules');
import {RPMs} from '../api/rpms.js'
//RPMs = new Mongo.Collection('rpms');
import PuppetModule from './PuppetModule.jsx';
import RPM from './RPM.jsx'
import UnitTypeSelect from './UnitTypeSelect.jsx'
import AppNotification from './AppNotification.jsx'
import CopyUnitDialog from './CopyUnitDialog.jsx'

// App component - represents the whole app
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query_text: ".*",
      finished_loading: false,
      copy_unit_data: null
    };
  }

  renderPuppetModules() {
    let filteredModules = this.props.modules;
    let labels = Meteor.settings.public.puppet_repo_labels;
    //console.log("***** props.modules: "+JSON.stringify(filteredModules))
    console.log("Render modules with state: ", this.state.query_text);
    if (this.state.query_text) {
      filteredModules = filteredModules.filter(module => module.name.match(this.state.query_text));
    }
    return filteredModules.map((module) => (
      <PuppetModule key={module._id} module={module} onCopyUnit={this.showCopyUnitDialog.bind(this)}
                    onPurgeUnit={this.showCopyUnitDialog.bind(this)}/>));
  }

  renderRPMS() {
    let filteredRPMs = this.props.rpms;
    let labels = Meteor.settings.public.rpm_repo_labels;
    console.log("Render rpm with state: ", this.state.query_text);
    //console.log("*** render rpms", JSON.stringify(this.props.rpms))
    if (this.state.query_text) {
      filteredRPMs = filteredRPMs.filter(rpm => rpm.name.match(this.state.query_text));
    }
    return filteredRPMs.map((rpm) => (<RPM key={rpm._id} rpm={rpm} onCopyUnit={this.showCopyUnitDialog.bind(this)}
                                           onPurgeUnit={this.showCopyUnitDialog.bind(this)}/>));
  }

  renderUnits() {
    if (this.state.unit_type === "puppet_module") {
      return this.renderPuppetModules();
    } else if (this.state.unit_type === "rpm") {
      return this.renderRPMS();
    }
  }

  showNotification(message) {
    console.log("AppNotification, message:", message);
    this.refs.appNotification.setState({open: true, message: message});
  }

  componentDidMount() {
    if (Meteor.user())
      this.showNotification("Finished loading!");
  }

  componentDidUpdate() {
    if (Meteor.user())
      this.showNotification("Finished loading!");
  }

  showCopyUnitDialog(action_data) {
    console.log("Copy unit dialog data:", action_data);
    this.refs.copyUnitDialog.setState({open: true, data: action_data});
  }

  doLogin() {
    Meteor.loginWithOidc({}, function (err) {
      if (err) {
        console.log("login error", err)
        if (err instanceof ServiceConfiguration.ConfigError && err.message.includes("not yet loaded")) {
          console.log("service not configured");
          return (<div> Login in progress <CircularProgress /></div>);
        } else {
          console.log("cannot authenticate user");
          throw new Meteor.Error('Cannot authenticat user, check authentication service !');
          return (<div>Error Login</div>);
        }

      } else {
        console.log("logged in successful");
        return null;
      }
    });
  }

  renderApp() {
    if (Meteor.user()) {
      console.log("User logged in");
      return (
        <div className="container">
            <AppBar title="Pulp Man" iconElementLeft={< IconButton tooltip="Home"> <ActionHome/> </IconButton>}
                    iconElementRight={<FlatButton label="Log out " onClick={this.handleLogout.bind(this)}/>}/>
            <Paper zDepth={2}>
                <form className="query_form" onSubmit={this.handleSubmit.bind(this)} style={{
                  margin: "0 10px"
                }}>
                    <UnitTypeSelect id="unitTypeInput" ref="unitTypeInput"/>
                    <TextField id="queryInput" hintText="Unit Name" ref="queryInput"/>
                </form>
            </Paper>
            <div>
                <br/> {this.renderUnits()}
            </div>
            <CopyUnitDialog ref="copyUnitDialog" open={this.state.show_copy_unit_dialog}
                            errorHandler={this.showNotification.bind(this)}/>
            <AppNotification ref="appNotification"/>

        </div>
      );
    } else {
      this.doLogin()
      if (Meteor.loggingIn()) {
        console.log("Logging in progress");
        return (<div>Login in progress <CircularProgress /></div>)
      } else {
        return null;
      }
    }
  }

  render() {
    return (
      <MuiThemeProvider>
        {this.renderApp()}
      </MuiThemeProvider>
    );
  }

  handleSubmit(event) {
    event.preventDefault();
    const unit_type = this.refs.unitTypeInput.state.value;
    console.log("Choosing unit type:", unit_type);
    // Find the text field via the React ref
    const text = this.refs.queryInput.getValue();

    //const filtered=PuppetModules.find(match_cond).fetch()
    this.setState({query_text: text, unit_type: unit_type});
    // Clear form
    //ReactDOM.findDOMNode(this.refs.queryInput).value = '';
  }

  handleLogout(event) {
    if (Meteor.user()) {
      console.log("Logging out current user");
      Meteor.logout();
    }
    event.preventDefault();
  }
}

App.propTypes = {
  modules: PropTypes.array.isRequired,
  rpms: PropTypes.array.isRequired
};

export default createContainer(() => {
  Meteor.subscribe('modules', {
    refresh_publication: Session.get('refresh_modules_publication')
  }, {
    onStop: function (e) {
      console.log(e.message);
    }
  });
  Meteor.subscribe('rpms', {refresh_publication: Session.get('refresh_rpm_publication')});
  return {modules: PuppetModules.find({}).fetch(), rpms: RPMs.find({}).fetch()};
}, App);
