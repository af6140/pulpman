import React, { Component, PropTypes } from 'react';
import { Random } from 'meteor/random'
import {
    Meteor
} from 'meteor/meteor'
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';

import RPMVersionInfo from './RPMVersionInfo.jsx'
import RPMSummary from './RPMSummary.jsx'

// Task component - represents a single todo item
export default class RPM extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repositories:Meteor.settings.public.rpm_repos,
      repo_labels: Meteor.settings.public.rpm_repo_labels
    };
  }
  render() {
    const name=this.props.rpm.name;
    const id = this.props.rpm.id;
    const labels =Meteor.settings.public.rpm_repo_labels;
    const all_stages = Meteor.settings.public.rpm_repos;
    const max_versions = this.props.max_versions ? this.props.max_versions : 100;
    const versions=this.props.rpm.versions;
    const version_keys = Object.keys(this.props.rpm.versions).slice(0,max_versions-1);


    const version_info_table= <RPMVersionInfo
      key={Random.id}
      versions={versions}
      labels={labels}
      all_stages={all_stages}
      onCopyUnit={this.props.onCopyUnit}
      onPurgeUnit={this.props.onPurgeUnit}
      unit_name={name}
    />

    return (
      <div>
      <br />
      <Chip>
        <Avatar src="images/rpm_icon_32.png"  />
        {name}
      </Chip>
      <RPMSummary key={id} target_repos={this.state.repositories} rpm={this.props.rpm} repo_labels={this.state.repo_labels} />
      {version_info_table}
      </div>
    );
  }
}

RPM.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  rpm: PropTypes.object.isRequired,
  onCopyUnit: PropTypes.func.isRequired,
  onPurgeUnit: PropTypes.func.isRequired
};
