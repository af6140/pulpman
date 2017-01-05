import React, {Component, PropTypes} from 'react';

import {Meteor} from 'meteor/meteor'

import Snackbar from 'material-ui/Snackbar';

// Task component - represents a single todo item
export default class AppNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "Loading completed.",
      open: false
    };
  }

  render() {
    return (<Snackbar open={this.state.open} message={this.state.message} autoHideDuration={2000}/>);

  }
}
