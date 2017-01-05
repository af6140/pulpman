import React, {Component, PropTypes} from 'react';

import {
    Meteor
} from 'meteor/meteor'

import rpmver from '../../lib/rpmver'

import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import {gray600, indigoA200, white} from 'material-ui/styles/colors';
import Chip from 'material-ui/Chip';
import FlatButton from 'material-ui/FlatButton';

export default class RPMSummary extends Component {
  constructor(props) {
    super(props);
  }

  repoStats() {
    const versions = this.props.rpm.versions;
    const target_repos = this.props.target_repos;

    var versionCount = {};
    var latestVersion = {};
    _.each(target_repos, function(target_repo) {
      versionCount[target_repo] = 0;
      latestVersion[target_repo] = '0.0.0-0';
    });

    _.each(versions, function(version) {
      _.each(version.repositories, function(repo) {
        versionCount[repo] = versionCount[repo] + 1;
        if(rpmver.cmp(latestVersion[repo], version.version) < 0) {
          latestVersion[repo] = version.version;
        }
      });

    });
    const data = {
      'versionCount': versionCount,
      'latestVersion': latestVersion,
    };
    return data;
  }

  renderBadge(repo, moduleCount, latestVersion, label) {

    const badge=<div key={label} style={{display: 'inline-block'}}>
     <Badge
      badgeContent={moduleCount}
      key={repo}
      badgeStyle={{top:10, right:10}}
      primary={true}
    >
      <Avatar size={24} color={white} backgroundColor={indigoA200}>
        {label}
      </Avatar>
    </Badge>
    {latestVersion}
    </div>;

    return (
      latestVersion !== '0.0.0-0' ?
      badge
       : null
    );
  }

  render() {
    const self=this
    const rpm = this.props.rpm;
    const target_repos = this.props.target_repos;
    const stats = this.repoStats();

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

RPMSummary.propTypes = {
  rpm: PropTypes.object.isRequired,
  target_repos: PropTypes.array.isRequired,
  repo_labels: PropTypes.array.isRequired
};
