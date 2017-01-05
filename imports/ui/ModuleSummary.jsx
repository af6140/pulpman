import React, {Component, PropTypes} from 'react';

import {
    Meteor
} from 'meteor/meteor'

import semver from 'semver'

import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import {gray600, indigoA200, white} from 'material-ui/styles/colors';
import Chip from 'material-ui/Chip';
import FlatButton from 'material-ui/FlatButton';
import muiThemeable from 'material-ui/styles/muiThemeable';


export default class ModuleSummary extends Component {
  constructor(props) {
    super(props);
  }

  repoStats() {
    const versions = this.props.module.versions;
    const target_repos = this.props.target_repos;

    var versionCount = {};
    var latestVersion = {};

    _.each(target_repos, function(target_repo) {
      versionCount[target_repo] = 0;
      latestVersion[target_repo] = '0.0.0';
    });

    _.each(versions, function(version) {
      _.each(version.repositories, function(repo) {
        versionCount[repo] = versionCount[repo] + 1;
        if(semver(latestVersion[repo]) < semver(version.version)) {
          latestVersion[repo] = version.version;
        }
      });

    });
    const data = {
      'versionCount': versionCount,
      'latestVersion': latestVersion
    };
    return data;
  }

  renderBadge(repo, moduleCount, latestVersion, label) {
    const chip = this.renderVersionChip(latestVersion);

    const badge= <div key={label} style={{display: 'inline-block'}}>
    <Badge
      badgeContent={moduleCount}
      key={repo}
      badgeStyle={{top:12, right:12}}
      primary={true}
    >
      <Avatar size={24} color={white} backgroundColor={indigoA200}>
        {label}
      </Avatar>
    </Badge>
    {latestVersion}
    </div> ;

    return (
      latestVersion !== '0.0.0' ?
      badge
       : null
    );
  }

  renderVersionChip(v){
    return (
      <FlatButton>{v}</FlatButton>
    );
  }

  render() {
    const self=this;
    const module = this.props.module;
    const target_repos = this.props.target_repos;

    const stats = this.repoStats();
    //console.log("muitheme:",self.props.muiTheme)
    return(
      <div>
      {
        target_repos.map((repo) => (
          this.renderBadge(repo, stats.versionCount[repo], stats.latestVersion[repo], this.props.repo_labels[target_repos.indexOf(repo)])
        ))
      }
      </div>
    );
  }

}

ModuleSummary.propTypes = {
  module: PropTypes.object.isRequired,
  target_repos: PropTypes.array.isRequired,
  repo_labels: PropTypes.array.isRequired
};
