import React, {Component, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';

// Dialog for copy(associate)/unassociate unit from repositories
export default class CopyUnitDialog extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      open: false
    });
  }
  handleClose(){
    this.setState({open:false});
  }
  handleUnitAssociation(){
    const errorHandler = this.props.errorHandler;
    const data = this.state.data;
    const delete_newer_version = this.refs.deleteNewerVersion.state.switched;

    console.log("Delete newer version: ", delete_newer_version);

    if(data.action === 1) {
      // copy
      var refresh_publication = false;
      Meteor.call("copy_unit", {unit_type: data.unit_type, unit_id:data.unit_id, from:data.from_repo, to: data.to_repo}, function(err, result){
        if(!err) {
          errorHandler("Unit version association finished!");
          refresh_publication = true;
        }else{
          errorHandler(err.message)
        }
      });
      if(delete_newer_version ) {
        Meteor.call("delete_newer_version", {from: data.to_repo, unit_type: data.unit_type, unit_id: data.unit_id , version: data.version, unit_name: data.unit_name}, function(err, result){
        if(!err) {
          refresh_publication = true;
          Meteor.setTimeout(function() {
            errorHandler("Unit version set as latest");
          }, 1500);
        }else{
          errorHandler(err.message)
        }
        });
      }
      if(refresh_publication) {
        if(data.unit_type==="puppet_module") {
          console.log("Setting modules refresh")
          Session.set("refresh_modules_publication")
        }else if (data.unit_type ==="rpm") {
          console.log("Setting rpms refresh")
          Session.set("refresh_rpm_publication")
        }
      }
    }else if(data.action ===-1){
      console.log("Unassociate unit")
      var refresh_publication = false;
      Meteor.call("unassociate_unit", {unit_type: data.unit_type, unit_id:data.unit_id, from:data.from_repo}, function(err, result){
        if(!err) {
          refresh_publication = true;
          errorHandler("Unit version removed from target repository!");
        }else {
          errorHandler(err.message)
        }
      });
      if (refresh_publication) {
        if(data.unit_type === "puppet_module") {
          console.log("Setting modules refresh")
          Session.set("refresh_modules_publication")
        }else if (data.unit_type === "rpm") {
          console.log("Setting rpms refresh")
          Session.set("refresh_rpm_publication")
        }
      }
    }else if(data.action===-2) { //purge unit
      var refresh_publication = false;
      console.log("purge unit");
      Meteor.call("delete_orphan_unit",{unit_type: data.unit_type, unit_id: data.unit_id},function(err,result){
        if(!err) {
          refresh_publication = true;
          errorHandler("Unit version purged!")
        }else {
          console.log(err)
          errorHandler(err.message)
        }
      });

      if (refresh_publication) {
        if(data.unit_type==="puppet_module") {
          console.log("Setting modules refresh")
          Session.set("refresh_modules_publication")
        }else if (data.unit_type ==="rpm") {
          console.log("Setting rpms refresh")
          Session.set("refresh_rpm_publication")
        }
      }
    }
    this.setState({open:false});
  }
  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary = {true}
        onTouchTap={this.handleClose.bind(this)}
      />,
      <FlatButton
        label = "Submit"
        primary = {false}
        onTouchTap = {this.handleUnitAssociation.bind(this)}
      />

    ];
    var message = "";
    var show_delete_newer = true;
    if(this.state.open)  {
      if (this.state.data.action ===1 ){
        message = "Copy to "+this.state.data.to_repo +"?";
        show_delete_newer = false;
      }else if(this.state.data.action === -1){
        message = "Remove from "+this.state.data.from_repo +"?";
      }else if(this.state.data.action === -2){
        message = "Purge orphaned unit";
      }
    }
    return(
      <div>
        <Dialog
          titile="Unit Version Operation Confirmation"
          actions={actions}
          modal={true}
          open={this.state.open}>
            {message}
            <Checkbox
              label="As latest version in destination"
              defaultChecked={false}
              ref="deleteNewerVersion"
              disabled = {show_delete_newer}
            />
        </Dialog>
      </div>
    );
  }
}
CopyUnitDialog.propTypes={
  errorHandler: PropTypes.func.isRequired
};
