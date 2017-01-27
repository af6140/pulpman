import React, {Component, PropTypes} from 'react';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import PublishRepoChip from './PublishRepoChip';
import Toggle from 'material-ui/Toggle';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

const styles = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  paper: {
    margin: 20,
    display: 'inline-block',
  },
  toggleDiv: {
    maxWidth: 250,
  }
};

export default class AppToolBar extends  Component {
  constructor(props){
    super(props);
    this.state = {
      force_publish: false,
    }
  }
  render() {
    var repos = this.props.repositories;
    var unit_type = this.props.unit_type;
    var unit_type = unit_type ? unit_type : 'puppet_module';
    var filtered_repos = repos.filter(repo => repo.unit_type.match(unit_type));
    // sort based on array in config
    var sorting=unit_type === 'puppet_module' ? Meteor.settings.public.puppet_repos : Meteor.settings.public.rpm_repos;
    var sorted_repos = [];
    sorting.forEach(function(key){
      filtered_repos.filter(function(item){
        if(item.repo_id===key) {
          sorted_repos.push(item);
        }
      })
    })
    var repo_components = sorted_repos.map((repo) => (
      <PublishRepoChip key={repo.repo_id} repo={repo} errorHandler={this.props.errorHandler} forcePublish={this.state.force_publish}/>
    ));
    return (
      <div>
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          Repository Status
        </ToolbarGroup>
        <ToolbarGroup>
            <Toggle
              label="Force publish"
              toggled={this.state.force_publish}
              onToggle={this.handleToggle.bind(this)}
            />
        </ToolbarGroup>
      </Toolbar>
      <div style={styles.wrapper}>
        {repo_components}
      </div>
      </div>
    );
  }
  handleToggle(){
    console.log('toggle, current state: '+ this.state.force_publish);
    this.setState({
      force_publish: ! this.state.force_publish
    });
  }
}

AppToolBar.propTypes = {
  repositories: PropTypes.array.isRequired,
  errorHandler: PropTypes.func.isRequired,
}