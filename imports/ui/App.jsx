/*global PuppetModules RPMs*/
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Meteor} from 'meteor/meteor';
import {createContainer} from 'meteor/react-meteor-data';
import {Session} from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var'

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

import { browserHistory } from 'react-router'

import {PuppetModules} from '../api/modules.js'
//PuppetModules = new Mongo.Collection('modules');
import {RPMs} from '../api/rpms.js'
//RPMs = new Mongo.Collection('rpms');
import {Repositories} from '../api/repositories'

import PuppetModule from './PuppetModule.jsx';
import RPM from './RPM.jsx'
import UnitTypeSelect from './UnitTypeSelect.jsx'
import AppNotification from './AppNotification.jsx'
import CopyUnitDialog from './CopyUnitDialog.jsx'
import AppToolBar from './AppToolBar'

// App component - represents the whole app
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query_text: null,
      finished_loading: false,
      copy_unit_data: null,
    };
  }

  renderPuppetModules() {
    if (this.state.query_text===null) {
      return null;
    }
    let filteredModules = this.props.modules;
    let labels = Meteor.settings.public.puppet_repo_labels;
    let log_level = Meteor.settings.log_level;
    if ('debug' === log_level) {
      console.log("***** props.modules: " + JSON.stringify(filteredModules));
    }
    console.log("Render modules with state: ", this.state.query_text);
    if (this.state.query_text) {
      filteredModules = filteredModules.filter(module => module.name.match(this.state.query_text));
    }
    return filteredModules.map((module) => (
      <PuppetModule key={module._id} module={module} onCopyUnit={this.showCopyUnitDialog.bind(this)}
                    onPurgeUnit={this.showCopyUnitDialog.bind(this)}/>));
  }

  renderRPMS() {
    if (this.state.query_text===null) {
      return null;
    }
    let filteredRPMs = this.props.rpms;
    let labels = Meteor.settings.public.rpm_repo_labels;
    let log_level = Meteor.settings.log_level;
    if ('debug' === log_level) {
      console.log("*** render rpms", JSON.stringify(this.props.rpms));
    }
    console.log("Render rpm with state: ", this.state.query_text);
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
    console.log("App did mount:" +JSON.stringify(this.props));
    if (Meteor.user() || Meteor.settings.public.disable_auth===true) {
      this.showNotification("Finished loading!");
    }
    else {
      console.log("No user available");
    }
  }

  componentDidUpdate() {
    if (Meteor.user() || Meteor.settings.public.disable_auth===true) {
      this.showNotification("Finished loading!");
    }
  }
  componentWillMount() {
    // if (Meteor.user())
    //   this.showNotification("Finished loading!");
  }

  showCopyUnitDialog(action_data) {
    console.log("Copy unit dialog data:", action_data);
    this.refs.copyUnitDialog.setState({open: true, data: action_data});
  }

  handleFormUnitTypeChange(unit_type) {
    this.setState({
      unit_type: unit_type,
      query_text :null
    });
  }


  renderApp() {
    console.log("render app");

    if(true) {
      return (
        <div className="container">
          <AppBar title="Pulp Man" iconElementLeft={< IconButton tooltip="Home"> <ActionHome/> </IconButton>}
                  iconElementRight={<FlatButton label="Log out " onClick={this.handleLogout.bind(this)}/>}/>
          <Paper zDepth={2}>
            <form className="query_form" onSubmit={this.handleSubmit.bind(this)} style={{
              margin: "0 10px"
            }}>
              <UnitTypeSelect id="unitTypeInput" ref="unitTypeInput" changeListener={this.handleFormUnitTypeChange.bind(this)} />
              <TextField id="queryInput" hintText="Unit Name" ref="queryInput"/>
            </form>
          </Paper>
          <AppToolBar ref="appToolBar" repositories={this.props.repositories} unit_type={this.state.unit_type} errorHandler={this.showNotification.bind(this)} />
          <div>
            <br/> {this.renderUnits()}
          </div>
          <CopyUnitDialog ref="copyUnitDialog" open={this.state.show_copy_unit_dialog}
                          errorHandler={this.showNotification.bind(this)}/>
          <AppNotification ref="appNotification"/>

        </div>
      );
    }else {
      return (
      <div className="container">
        <AppBar title="Pulp Man" iconElementLeft={< IconButton tooltip="Home"> <ActionHome/> </IconButton>}
                iconElementRight={<FlatButton label="Log out " onClick={this.handleLogout.bind(this)}/>}/>
        <div>
          Not authorized
        </div>

        <AppNotification ref="appNotification"/>

      </div>
      );
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

  handleLogout(e) {
    e.preventDefault();
    if(!Meteor.settings.public.disable_auth) {
      Meteor.logout();
      browserHistory.push('/login');
    }
  }
}

App.propTypes = {
  modules: PropTypes.array.isRequired,
  rpms: PropTypes.array.isRequired
};

export default AppContainer = createContainer(() => {
  Meteor.subscribe("userData");
  Meteor.subscribe('modules', {refresh_publication: Session.get('refresh_modules_publication')});
  Meteor.subscribe('rpms', {refresh_publication: Session.get('refresh_rpm_publication')});
  Meteor.subscribe('repositories');
  return {
    modules: PuppetModules.find({}).fetch(),
    rpms: RPMs.find({}).fetch(),
    repositories: Repositories.find({}).fetch(),
  };
}, App);
