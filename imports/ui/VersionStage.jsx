import React, {Component, PropTypes} from 'react';
import {Step, Stepper, StepLabel, StepButton} from 'material-ui/Stepper';
import {Session} from 'meteor/session'

export default class VersionStage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clickIndex: -1
    };
  }

  handleClick(clickIndex, deployed) {
    console.log(clickIndex);
    const current_stages = this.props.current_stages
      ? this.props.current_stages
      : [];
    const all_stages = this.props.all_stages;
    const version = this.props.version;
    const unit_id = this.props.unit_id;
    const unit_name = this.props.unit_name;
    const trigger_id = unit_id + ":" + clickIndex;
    console.log("current_stages:", current_stages, " all_stages:", all_stages);
    console.log("Unit associatoin operation, current unit version state: ", deployed);
    console.log("Current stage index: ", clickIndex);
    if (!deployed) {
      const first_current = current_stages.length > 0
        ? current_stages[0]
        : null;
      console.log("first_current:", first_current)
      let from_repo_index = -1;
      if (first_current) {
        from_repo_index = all_stages.indexOf(first_current);
      }
      console.log("from_repo_index:", from_repo_index);
      const from_repo = from_repo_index > -1
        ? all_stages[from_repo_index]
        : undefined;
      const to_repo = all_stages[clickIndex];
      console.log("unit type :", this.props.unit_type);
      if (this.props.unit_type === "puppet_module") {
        console.log("Set reload puppet_module to true");
        if (from_repo_index > -1) {
          const action_data = {
            unit_id: unit_id,
            from_repo: from_repo,
            to_repo: to_repo,
            unit_type: "puppet_module",
            action: 1,
            version: version,
            unit_name: unit_name
          };
          this.props.onCopyUnit(action_data);
          this.setState({clickIndex: clickIndex})
        }
      } else if (this.props.unit_type === "rpm") {
        if (from_repo_index > -1) {
          const action_data = {
            unit_id: unit_id,
            from_repo: from_repo,
            to_repo: to_repo,
            unit_type: "rpm",
            action: 1,
            version: version,
            unit_name: unit_name
          };
          this.props.onCopyUnit(action_data);
          this.setState({clickIndex: clickIndex});
        }
      }
    } else { // already depolyed, unassociate
      console.log("Unit version already deployed, now undeploy.");
      const remove_repo = all_stages[clickIndex];
      if (clickIndex > 0 && current_stages.length > 0) { // do not unassociate first one or the only one
        const action_data = {
          unit_id: unit_id,
          from_repo: remove_repo,
          to_repo: null,
          unit_type: this.props.unit_type,
          unit_name: unit_name,
          action: -1
        };
        console.log("Undeploy unit version with data: ", JSON.stringify(action_data));
        this.props.onCopyUnit(action_data);
        this.setState({clickIndex: clickIndex});
      }
    }
  }

  render() {
    const all_stages = this.props.all_stages;
    const current_stages = this.props.current_stages
      ? this.props.current_stages
      : [];
    const labels = this.props.labels;
    const contentStyle = {
      margin: '0 16px',
      align: 'left',
      width: '100%'
    };
    //const stepIndex = this.state.stepIndex;
    return (
      <div style={contentStyle}>
        <Stepper linear={false}>
          { all_stages.map((stage, index) => (
              <Step key={index} completed={current_stages.includes(stage)}>
                <StepButton onClick={this.handleClick.bind(this, index, current_stages.includes(stage))}>
                  {labels[index]}
                </StepButton>
              </Step>
            ))
          }
        </Stepper>
      </div>
    );
  }
}

VersionStage.propTypes = {
  labels: PropTypes.array.isRequired,
  all_stages: PropTypes.array.isRequired,
  current_stages: PropTypes.array.isRequired,
  unit_id: PropTypes.string.isRequired,
  unit_type: PropTypes.string.isRequired,
  unit_name: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired
};
