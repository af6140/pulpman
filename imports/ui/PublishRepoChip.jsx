import React, {Component, PropTypes} from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import EditorPublish from 'material-ui/svg-icons/editor/publish';
import ContentLink from 'material-ui/svg-icons/content/link';

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
    var distributor_id = this.props.repo.unit_type === 'puppet_module' ? 'puppet_distributor' : 'yum_distributor';
    var repo_id = this.props.repo.repo_id;
    Meteor.call('publish_repo', {
      repo_id: repo_id,
      distributor_id: distributor_id,
    }, (err, res) => {
      if (err) {
        this.props.errorHandler('Failed to publish repo: ' + err.message);
      } else {
        this.props.errorHandler('Publish request submitted!');
      }
    });
  }
  showNotpublish() {
    this.props.errorHandler("Repository is set to auto publish, turn on 'Force Publish' to publish manually!")
  }
  goToRepo() {
    var url = Meteor.settings.public.pulp_rpm_repo_path+'/'+this.props.repo.relative_url;
    console.log('got to repository at url : ' + url);
    window.open(url, this.props.repo.repo_id);
  }
  render() {
    var repo = this.props.repo;
    var repo_id = repo.repo_id;
    var unit_type = repo.unit_type;
    var defined_repos = unit_type === 'puppet_module' ? Meteor.settings.public['puppet_repos'] : Meteor.settings.public['rpm_repos'];
    var defined_labels = unit_type === 'puppet_module' ? Meteor.settings.public['puppet_repo_labels'] : Meteor.settings.public['rpm_repo_labels'];
    var index = defined_repos.indexOf(repo_id);
    var label = 'NA'
    console.log("Force publish : " + this.props.forcePublish)
    var publish_enabled = this.props.forcePublish ? true : (repo.auto_publish ? false: true)
    if(index>=0) {
      label = defined_labels[index];
    }
    return (
      <Chip
        style={styles.chip}
      >
        <Avatar icon={<EditorPublish />} onTouchTap={!publish_enabled ? this.showNotpublish.bind(this): this.handleTouchTap.bind(this)} />
        {label} @ {new Date(repo.last_publish).toLocaleString()}
        {unit_type=== 'rpm' && <ContentLink onTouchTap={this.goToRepo.bind(this)}/>}
      </Chip>
    );
  }
}

PublishRepoChip.propTypes = {
  repo: PropTypes.object.isRequired,
  errorHandler: PropTypes.func.isRequired,
  forcePublish: PropTypes.bool.isRequired,
}