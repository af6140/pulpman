import React, { Component, PropTypes } from 'react';
import { Random } from 'meteor/random'
import {
    Meteor
} from 'meteor/meteor'
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import ModuleVersionInfo from './ModuleVersionInfo.jsx';
import ModuleSummary from './ModuleSummary.jsx';
import Tooltip from 'material-ui/internal/Tooltip';

// Task component - represents a single todo item
export default class PuppetModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repositories: Meteor.settings.public.puppet_repos,
      repo_labels : Meteor.settings.public.puppet_repo_labels,
      unitIdTooltip: false
    }
  }
  render() {
    let labels = Meteor.settings.public.puppet_repo_labels;
    let all_stages = Meteor.settings.public.puppet_repos;
    const name=this.props.module.name;
    const max_versions = this.props.max_versions ? this.props.max_versions : 100;
    const versions = this.props.module.versions.slice(0,max_versions-1);
    const id = this.props.module.id;
    const unit_id =this.props.module.unit_id;

    const version_info_table =  <ModuleVersionInfo
      key={Random.id}
      versions={versions}
      labels={labels}
      all_stages={all_stages}
      onCopyUnit={this.props.onCopyUnit}
      onPurgeUnit={this.props.onPurgeUnit}
      unit_name={name}
      /> ;

    return (
      <div>
      <br />
      <Chip>
        <Avatar src="images/puppet_icon_32.png"
          onMouseEnter={()=>{this.setState({unitIdTooltip: true})}}
          onMouseLeave={()=>{this.setState({unitIdTooltip: false})}}
        />
        {name}
      </Chip>
      <ModuleSummary key={id} target_repos={this.state.repositories} module={this.props.module} repo_labels={this.state.repo_labels} />
      {version_info_table}
      </div>
    );
  }
}

PuppetModule.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  module: PropTypes.object.isRequired,
  onCopyUnit: PropTypes.func.isRequired,
  onPurgeUnit: PropTypes.func.isRequired
};
