import React, {Component, PropTypes} from 'react';
import { Random } from 'meteor/random'

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import ActionDeleteForever from 'material-ui/svg-icons/action/delete-forever';
import ActionInfo from 'material-ui/svg-icons/action/info'

import VersionStage from './VersionStage.jsx'

export default class ModuleVersionInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fixedHeader: true,
      fixedFooter: true,
      stripedRows: false,
      showRowHover: false,
      selectable: false,
      height: '300px'
    };
  }
  handlePurgeModule(unit_id) {
    console.log("handle purge module ");
    const data = {
      unit_type: "puppet_module",
      unit_id: unit_id,
      action: -2
    };

    this.props.onPurgeUnit(data);
  }
  render() {
    console.log("Render ModuleVersionInfo");
    const versions = this.props.versions;
    const labels = this.props.labels;
    const all_stages = this.props.all_stages;
    const unit_name = this.props.unit_name;
    return (
      <div>
        <Table key={Random.id} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={this.state.selectable} height={versions.length < 5
          ? ''
          : this.state.height}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
            <TableRow>
              <TableHeaderColumn style={{
                width: '15%'
              }}>
                Module Version
              </TableHeaderColumn>
              <TableHeaderColumn style={{
                width: '15%'
              }}></TableHeaderColumn>
              <TableHeaderColumn style={{
                align: 'left'
              }}>
                Deployment Status
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {versions.map((version_info, index) => (
              <TableRow key={index}>
                <TableRowColumn style={{
                  width: '15%'
                }}>
                  <FlatButton label={version_info.version}/>
                </TableRowColumn>
                <TableRowColumn style={{
                  width: '15%'
                }}>
                  <IconButton disabled={version_info.repositories.length > 0} onClick={this.handlePurgeModule.bind(this, version_info.unit_id)}>
                    <ActionDeleteForever/>
                  </IconButton>
                  <IconButton disabled={false} tooltip={version_info.unit_id}  tooltipPosition="top-right">
                    <ActionInfo/>
                  </IconButton>
                </TableRowColumn>
                <TableRowColumn style={{
                  align: 'left'
                }}>
                  <VersionStage labels={labels} version={version_info.version} current_stages={version_info.repositories} all_stages={all_stages} unit_name={unit_name} unit_id={version_info.unit_id} unit_type={"puppet_module"} onCopyUnit={this.props.onCopyUnit}/>
                </TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    );
  }

}

ModuleVersionInfo.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  versions: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  all_stages: PropTypes.array.isRequired,
  onCopyUnit: PropTypes.func.isRequired,
  onPurgeUnit: PropTypes.func.isRequired,
  unit_name: PropTypes.string.isRequired
};
