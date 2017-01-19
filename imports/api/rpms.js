/*global PulpAuthToken logger*/
import {
  Meteor
} from 'meteor/meteor';
import {
  Mongo
} from 'meteor/mongo';

export const RPMs = new Mongo.Collection('rpms');

// https://fedoraproject.org/wiki/Archive:Tools/RPM/VersionComparison
function pm_parse_rpm_evra(evra) {
  var specs = evra.split('-');
  var result = {
    "epoch": specs[0],
    "version": specs[1],
    "release": specs[2],
    "arch": specs[3]
  };
  return result;
}

function pm_parse_label(label) {
  var label_regex = /[0-9]+|[a-zA-Z]+/g;
  var elements = label.match(label_regex); //array of components only consecutive numbers and letters
  //console.log("elements:", elements)
  return elements;
}

function pm_cmp_element(ea, eb) {
  var ea_isNumber = Number.parseInt(ea) ? true : false;
  var eb_isNumber = Number.parseInt(eb) ? true : false;

  if (ea_isNumber) {
    if (eb_isNumber) {
      var ea_i = Number.parseInt(ea);
      var eb_i = Number.parseInt(eb);
      if (ea_i > eb_i) {
        return 1;
      } else if (ea_i === eb_i) {
        return 0;
      } else {
        return -1;
      }
    } else {
      return 1;
    }
  } else { // ea is not a number
    if (eb_isNumber) {
      return -1;
    } else { //eb is not a number
      return ea < eb ? -1 : (ea > eb ? 1 : 0);
    }
  }
}

function pm_compare_labels(vs_a, vs_b) {
  var v_a = pm_parse_label(vs_a);
  var v_b = pm_parse_label(vs_b);
  var max_loop = Math.min(v_a.length, v_b.length);
  for (var i = 0; i < max_loop; i++) {
    if (pm_cmp_element(v_a[i], v_b[i]) == 1) {
      return 1;
    } else if (pm_cmp_element(v_a[i], v_b[i]) == -1) {
      return -1;
    }
  }
  if (v_a.length > v_b.length) {
    return 1;
  } else if (v_a.length < v_b.length) {
    return -1;
  } else {
    return 0;
  }
}

function compare_rpm_vr(a, b) {
  var a_specs = a.split("-");
  var b_specs = b.split("-");

  var a_version = a_specs[1];
  var b_version = b_specs[1];
  var a_release = a_specs[2];
  var b_release = b_specs[2];
  var v_compare = pm_compare_labels(a_version, b_version);
  if (v_compare === 1) {
    return 1;
  } else if (v_compare === -1) {
    return -1;
  } else {
    var b_compare = pm_compare_labels(a_release, b_release);
    if (b_compare === 1) {
      return 1;
    } else if (b_compare === -1) {
      return -1;
    } else {
      return 0;
    }
  }
}

function compare_rpm_versions(a, b) {
  return compare_rpm_vr(a.version, b.version);
}

if (Meteor.isServer) {
  const target_repos = Meteor.settings.public.rpm_repos;
  var query_body = {
    "criteria": {
      "fields": {
        "unit": ["name", "version", "release", "epoch", "arch"]
      },
      "filters": {
        "unit": {
          "name": {
            "$regex": ".*"
          }
        }
      },
      "type_ids": [
        "rpm"
      ]
    },
    "remove_duplicates": "true"
  };


  Meteor.publish('rpms', function () {
    var init = true;
    var self = this;
    logger.info("Publish rpms");

    var refresh_interval = Meteor.settings.rpm_refresh_interval;
    Meteor.setInterval(function query_rpm_data() {
      logger.info("Quering RPM");
      var raw_data = {};
      for (var j = 0; j < target_repos.length; j++) {
        var repo = target_repos[j];
        var httpobj = {
          "method": "POST",
          "path": Meteor.settings.pulp_url + '/api/v2/repositories/' + repo + '/search/units/',
          "headers": {
            "Content-Type": "application/json",
          },
          "auth":  Meteor.settings.admin_user + ':' + Meteor.settings.admin_password,
          "entity": JSON.stringify(query_body)
        };
        logger.info("Query repo:", repo);
        try {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          var response = HTTP.post(httpobj["path"], {
            "headers": httpobj["headers"],
            "content": httpobj["entity"],
            "auth": httpobj["auth"],
            "followRedirects": true,
          });
          var response_json = JSON.parse(response["content"]);
          _.each(response_json, function (query_data) {
            var unit_id = query_data.metadata._id;
            var repo_id = query_data.repo_id;
            var name = query_data.metadata.name;
            var version = query_data.metadata.version;
            var release = query_data.metadata.release;
            var arch = query_data.metadata.arch;
            var epoch = query_data.metadata.epoch;
              //console.log(JSON.stringify(query_data.metadata))

            var full_ver = epoch + '-' + version + '-' + release + '-' + arch;
              //console.log("raw_data:", raw_data)
            //console.log("unit_id:", unit_id);
            if (name in raw_data) {
              var versions = raw_data[name]['versions'];
              if (full_ver in versions) {
                if(unit_id in raw_data[name]['versions'][full_ver]) {
                  raw_data[name]['versions'][full_ver][unit_id]["repositories"].push(repo_id);
                }else {
                  var ver_data= {
                    "repositories": [repo_id]
                  };
                  raw_data[name]['versions'][full_ver][unit_id]=ver_data;
                }
              } else { //not in versions
                var unit_data = {};
                unit_data[unit_id] ={
                  "repositories": [repo_id]
                };
                raw_data[name]['versions'][full_ver] = unit_data;
              }
            } else {
              raw_data[name] = {};
              raw_data[name]['versions']={};
              raw_data[name]['versions'][full_ver]={};
              var unit_data = {
                "repositories": [repo_id]
              };
              raw_data[name]['versions'][full_ver][unit_id] = unit_data;
              raw_data[name]['name'] = name;
            }
          });
        } catch (error) {
          logger.error(error.message);
          throw new Meteor.Error("Server Side Error:", error.message);
        }
      }

      var rpms_pub = {};
      logger.debug("RPMs query response raw_data:");
      logger.debug(JSON.stringify(raw_data,null,2));
      _.each(raw_data, function (rpm_info, rpm_name) {
        var versions = rpm_info['versions'];
        _.each(versions, function(unit_vs, full_ver) {
          //console.log(unit_vs);
          var unit_index=0;
           _.each(unit_vs, function(version, unit_id) {
             var unit_key = rpm_name + '_' + unit_index;
             var ver_data = {};
             ver_data['version'] = full_ver;
             ver_data['repositories'] = unit_vs[unit_id]['repositories'];
             ver_data['unit_id'] = unit_id;
             if(unit_key in rpms_pub) {
               rpms_pub[unit_key]['versions'].push(ver_data);
             }else {
               rpms_pub[unit_key] = {};
               rpms_pub[unit_key]['versions']=[ver_data];
               rpms_pub[unit_key]['name']=rpm_name;
             }
             unit_index = unit_index+1;
             //console.log(rpm_data);
           });
        });
      });

      _.each(rpms_pub, function(version_data, rpm_key){
        var rpm_data  = {
          "id": rpm_key,
          "name": version_data['name'],
          "versions": version_data['versions'].sort(compare_rpm_versions).reverse()
        };
        if (init) {
          self.added('rpms', rpm_key, rpm_data);
        } else {
          self.changed('rpms', rpm_key, rpm_data);
        }
      });
      logger.debug("Rpms query result:");
      logger.debug(JSON.stringify(rpms_pub,null,2));
      self.ready();
      init = false;
      return query_rpm_data;
    }(), refresh_interval);
  });
}
