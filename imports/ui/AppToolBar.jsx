import React, {Component, PropTypes} from 'react';
import PublishRepoChip from './PublishRepoChip';

const styles = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

export default class AppToolBar extends  Component {
  constructor(props){
    super(props)
  }
  render() {
    var repos = this.props.repositories;
    var unit_type = this.props.unit_type;
    unit_type = unit_type ? unit_type : 'puppet_module'
    var filtered_repos = repos.filter(repo => repo.unit_type.match(unit_type))
    var repo_components = filtered_repos.map((repo) => (
      <PublishRepoChip key={repo.repo_id} repo={repo} errorHandler={this.props.errorHandler}/>
    ));
    return (
      <div style={styles.wrapper}>
        {repo_components}
      </div>
    );
  }
}

AppToolBar.propTypes = {
  repositories: PropTypes.array.isRequired,
  errorHandler: PropTypes.func.isRequired,
}