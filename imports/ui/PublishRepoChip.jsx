import React, {Component, PropTypes} from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

const styles = {
  chip: {
    margin: 4,
  }
};

export default class PublishRepoChip extends Component {
  constructor(props) {
    super(props)
  }

  handleTouchTap(){
    console.log('publish to be called')
  }
  showNotpublish() {
    this.props.errorHandler('Repository is set to auto publish!')
  }
  render() {
    var repo = this.props.repo;
    var repo_id = repo.repo_id;
    var unit_type = repo.unit_type;
    var defined_repos = unit_type === 'puppet_module' ? Meteor.settings.public['puppet_repos'] : Meteor.settings.public['rpm_repos'];
    var defined_labels = unit_type === 'puppet_module' ? Meteor.settings.public['puppet_repo_labels'] : Meteor.settings.public['rpm_repo_labels'];
    var index = defined_repos.indexOf(repo_id);
    var label = 'NA'
    var avartar_text = unit_type === 'puppet_module' ? 'P' : 'R';
    if(index>=0) {
      label = defined_labels[index];
    }
    return (
      <Chip
        onTouchTap={repo.auto_publish? this.showNotpublish.bind(this): this.handleTouchTap}
        style={styles.chip}
      >
        <Avatar size={32}>{avartar_text}</Avatar>
        {label}
      </Chip>
    );
  }
}

PublishRepoChip.propTypes = {
  repo: PropTypes.object.isRequired,
  errorHandler: PropTypes.func.isRequired,
}