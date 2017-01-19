/*global PulpAuthToken logger*/
import {
  Meteor
} from 'meteor/meteor';
import {
  HTTP
} from 'meteor/http';
import {
  check,
  Match
} from 'meteor/check';

if (Meteor.isServer) {
  Meteor.methods({
    'copy_unit' ({
      unit_type,
      unit_id,
      from,
      to
    }) {
      logger.log("copy ", unit_id, "from ", from, "to ", to);
      const query_body = {
        'source_repo_id': from,
        'criteria': {
          'filters': {
            'unit': {
              '_id': unit_id
            }
          }
        }
      };
      var httpobj = {
        "method": "POST",
        "path": Meteor.settings.pulp_url + '/api/v2/repositories/' + to + '/actions/associate/',
        "headers": {
          "Content-Type": "application/json",
        },
        "auth":  Meteor.settings.admin_user + ':' + Meteor.settings.admin_password,
        "entity": JSON.stringify(query_body)
      };
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      try {
        var response = HTTP.post(httpobj["path"], {
          "headers": httpobj["headers"],
          "content": httpobj["entity"],
          "auth": httpobj["auth"],
          "followRedirects": true,
          "timeout": 30000
        });
        //response code 202
        logger.debug("copy unit response: " + JSON.stringify(response));
        if (response.statusCode === 202) {
          logger.info(unit_id+ ' associated with: '+ to);
          return unit_id+ ' associated with: '+ to;
        } else {
          throw new Meteor.Error("Unit association failed with status  " + response.statusCode);
        }
      } catch (error) {
        logger.error(error);
        throw new Meteor.Error("Failed to invoke pulp api: " + error);
      }
    },
    'delete_orphan_unit' ({
      unit_type,
      unit_id
    }) {
      var httpobj = {
        "method": "DELETE",
        "path": Meteor.settings.pulp_url + '/api/v2/content/orphans/' + unit_type + '/' + unit_id + '/',
        "headers": {
          "Content-Type": "application/json"
        },
        "auth":  Meteor.settings.admin_user + ':' + Meteor.settings.admin_password,
      };
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      try {
        logger.info("delete orphans:", JSON.stringify(httpobj));
        var response = HTTP.del(httpobj["path"], {
          "headers": httpobj["headers"],
          "auth": httpobj["auth"],
          "followRedirects": true,
          "timeout": 30000
        });
        //response code 202
        logger.info("purge unit response: " + JSON.stringify(response));
        if (response.statusCode === 202) {
          logger.info("Orphened unit "+unit_id + " purged!");
          return "Orphened unit "+unit_id + " purged!";
        } else {
          throw new Meteor.Error("Purge orphened unit error: with status  " + response.statusCode);
        }
      } catch (error) {
        logger.error(error);
        throw new Meteor.Error("Failed to invoke pulp api: " + error);
      }
    },
    'unassociate_unit' ({
      unit_type,
      unit_id,
      from
    }) {
      logger.info("unassociate " + unit_id + ' from ' + from);
      const query_body = {
        'source_repo_id': from,
        'criteria': {
          'filters': {
            'unit': {
              '_id': unit_id
            }
          }
        }
      };
      var httpobj = {
        "method": "POST",
        "path": Meteor.settings.pulp_url + '/api/v2/repositories/' + from + '/actions/unassociate/',
        "headers": {
          "Content-Type": "application/json"
        },
        "auth":  Meteor.settings.admin_user + ':' + Meteor.settings.admin_password,
        "entity": JSON.stringify(query_body)
      };
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      try {
        var response = HTTP.post(httpobj["path"], {
          "headers": httpobj["headers"],
          "content": httpobj["entity"],
          "auth": httpobj["auth"],
          "followRedirects": true,
          "timeout": 30000
        });
        //response code 202
        if (response.statusCode === 202) {
          logger.info("Unit deassociated from " + from);
          return "Unit deassociated from " + from;
        } else {
          throw new Meteor.Error("Unit cannot be deassociated from " +from + ", error: with status  " + response.statusCode);
        }
      } catch (error) {
        logger.error(error);
        throw new Meteor.Error("Failed to invoke pulp api: " + error);
      }
    },
    'delete_newer_version' ({
      from,
      unit_type,
      unit_id,
      version,
      unit_name
    }) {
      logger.info("delete_newer_version of unit ", unit_name + ' newer than ' + version);
      var query_body = null;
      if (unit_type==="puppet_module"){
        var name_specs=unit_name.split('-');
        var module_author = name_specs[0];
        var module_name = name_specs[1];
        query_body = {
          "criteria": {
            'type_ids': ['puppet_module'],
            'filters': {
              'unit' : {
                '$and': [
                  {
                    name: module_name
                  },
                  {
                    author: module_author
                  },
                  {
                    version: {
                      '$gt': version
                    }
                  }
                ]
              }
            }
          }
        };
      }else if(unit_type === "rpm") {
        var version_specs=version.split('-');
        var epoch = version_specs[0];
        var rpm_version = version_specs[1];
        var rpm_release = version_specs[2];
        var rpm_arch = version_specs[3];
        query_body = {
          "criteria" : {
            'type_ids': ['rpm'],
            'filters': {
              'unit': {
                '$and': [
                  { 'name': name},
                  { 'arch': rpm_arch},
                  {
                    "$or": [
                       {
                         "version" : {
                           "$gt" : rpm_version
                         }
                       },
                       {
                         "version": rpm_version,
                         "release": {
                           "$gt": rpm_release
                         }
                       }
                    ]
                  }
                ]
              }
            }
          }
        };
      }
      if(query_body) {
        const httpobj = {
          "method": "POST",
          "path": Meteor.settings.pulp_url + '/api/v2/repositories/' + from + '/actions/unassociate/',
          "headers": {
            "Content-Type": "application/json"
          },
          "auth":  Meteor.settings.admin_user + ':' + Meteor.settings.admin_password,
          "entity": JSON.stringify(query_body)
        };
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        try {
          logger.info("delete newer unit version  ....");
          logger.info("Delete newer version with query: "+ JSON.stringify(query_body));
          var response = HTTP.post(httpobj["path"], {
            "headers": httpobj["headers"],
            "content": httpobj["entity"],
            "auth": httpobj["auth"],
            "followRedirects": true,
            "timeout": 30000
          });
          //response code 202
          if (response.statusCode === 202) {
            var return_msg = "Deleted version newer than " + version + " of " + unit_name + " from " + from;
            logger.info(return_msg);
            return return_msg;
          } else {
            throw new Meteor.Error("Failed to delete newer version, status = ", response.statusCode);
          }
        } catch (error) {
          logger.error(error);
          throw new Meteor.Error("Failed to invoke pulp api: " + error);
        }
      } else {
        throw new Meteor.Error("Query body is null");
      }
    } // end of method
  }); // End of Metehor.methods
}
