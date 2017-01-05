/*global PulpAuthToken logger*/
import {
  Meteor
} from 'meteor/meteor';
import {
  check,
  Match
} from 'meteor/check';
import {
  Mongo
} from 'meteor/mongo';
import {
  HTTP
} from 'meteor/http';

import semver from 'semver';

export const PuppetModules = new Mongo.Collection('modules');

function compare_module_versions(a, b) {
  return semver.compare(a.version, b.version);
}

if (Meteor.isServer) {
  var query_body = {
    "criteria": {
      "fields": ["author", "name", "version", "id", "pulp_user_metadata"],
      "filters": {
        "name": {
          "$regex": ".*"
        }
      }
    },
    "include_repos": "true"
  };


  var refresh_interval = Meteor.settings.puppet_refresh_interval;

  Meteor.publish('modules', function (params) {
    var init = true;
    var self = this;
    logger.info("Publish modules with params: ", params);
    logger.info("PulpAuthToken: ", PulpAuthToken);
    var httpobj = {
      "method": "POST",
      "path": Meteor.settings.pulp_url + '/api/v2/content/units/puppet_module/search/',
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Basic " + PulpAuthToken
      },
      "entity": JSON.stringify(query_body)
    };
    Meteor.setInterval(function query_modules_data() {
      var raw_data = {};
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      try {
        logger.info("Quering modules ....");
        var response = HTTP.post(httpobj["path"], {
          "headers": httpobj["headers"],
          "content": httpobj["entity"],
          "followRedirects": true,
          "timeout": 5000
        });
        logger.info("Finished pulp api call");
        var response_json = JSON.parse(response["content"]);
        _.each(response_json, function (module_data) {
          var name = module_data['author'].concat('-').concat(module_data['name']);
          //console.log("####module key:"+module_key)
          var module_version = module_data['version'];
          var module_repositories = module_data['repository_memberships'];
          var unit_id = module_data['_id'];

          if(name in raw_data) {
            var versions = raw_data[name]['versions'];
            if (module_version in versions) {
              if(unit_id in raw_data[name]['versions'][module_version]) {
                //raw_data[name]['versions'][module_version][unit_id]["repositories"].push(repo_id)
                // do nothing
              }else {
                var ver_data= {
                  "repositories": module_repositories
                };
                raw_data[name]['versions'][module_version][unit_id]=ver_data;
              }
            } else { //not in versions
              var unit_data = {};
              unit_data[unit_id] ={
                "repositories": module_repositories
              };
              raw_data[name]['versions'][module_version] = unit_data;
            }
          }else {
            raw_data[name] = {};
            raw_data[name]['versions'] = {};
            raw_data[name]['versions'][module_version]={};
            var unit_data = {
              "repositories": module_repositories
            };
            raw_data[name]['versions'][module_version][unit_id] = unit_data;
            raw_data[name]['name'] = name;
          }
        });
        logger.debug('raw_data:', JSON.stringify(raw_data,null, 2));
        var modules_pub = {};
        _.each(raw_data, function (module_info, module_name) {
          var versions = module_info['versions'];
          logger.debug('add module_obj:', JSON.stringify(module_info,null,2));
          _.each(versions, function(unit_vs, module_version){
            var unit_index=0;
             _.each(unit_vs, function(version, unit_id) {
               var unit_key = module_name + '_' + unit_index;
               var ver_data = {};
               ver_data['version'] = module_version;
               ver_data['repositories'] = unit_vs[unit_id]['repositories'];
               ver_data['unit_id'] = unit_id;
               if(unit_key in modules_pub) {
                 modules_pub[unit_key]['versions'].push(ver_data);
               }else {
                 modules_pub[unit_key] = {};
                 modules_pub[unit_key]['versions']=[ver_data];
                 modules_pub[unit_key]['name']=module_name;
               }
               unit_index = unit_index + 1;
             });
          });
        });

        logger.debug(JSON.stringify(modules_pub,null,2));
        _.each(modules_pub, function(version_data, module_key){
          //console.log(module_key);
          var module_data  = {
            "id": module_key,
            "name": version_data['name'],
            "versions": version_data['versions'].sort(compare_module_versions).reverse()
          };
          if (init) {
            self.added('modules', module_key, module_data);
          } else {
            self.changed('modules', module_key, module_data);
          }
        });
      } catch (error) {
        logger.error(error.message);
        throw new Meteor.Error("Server Side Error:", error.message);
      }
      self.ready();
      init = false;
      return query_modules_data;
    }(), refresh_interval);
  });

}
