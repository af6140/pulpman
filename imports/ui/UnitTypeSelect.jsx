import React, {Component, PropTypes} from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

/**
 * With a `label` applied to each `MenuItem`, `SelectField` displays
 * a complementary description of the selected item.
 */
export default class UnitTypeSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {value: "puppet_module"};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (event, index, value) {
    this.setState({value});
    this.props.changeListener(value);
  }
  render() {
    return (
      <SelectField value={this.state.value} onChange={this.handleChange}>
        <MenuItem value="puppet_module"  primaryText="Puppet Module" />
        <MenuItem value="rpm"  primaryText="RPM Package" />
      </SelectField>
    );
  }
}
UnitTypeSelect.propTypes = {
  changeListener: PropTypes.func.isRequired,
}