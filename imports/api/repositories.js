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

export const Repositories = new Mongo.Collection('repositories');



if (Meteor.isServer) {
  var query_params = {
    details: true
  };

  var refresh_interval = Meteor.settings.repo_refresh_interval ? Meteor.settings.repo_refresh_interval : 30000;

  Meteor.publish('repositories', function (params) {
    var init = true;
    var self = this;
    var httpobj = {
      "method": "GET",
      "path": Meteor.settings.pulp_url + '/api/v2/repositories/?distributors=true',
      "headers": {
        "Content-Type": "application/json",
      },
      "auth":  Meteor.settings.admin_user + ':' + Meteor.settings.admin_password,
      "params": JSON.stringify(query_params)
    };
    logger.debug("httpobj: " + JSON.stringify(httpobj));
    Meteor.setInterval(function query_repo_data() {
      var raw_data = [];
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      try {
        logger.info("Quering repositories details");
        var response = HTTP.get(httpobj["path"], {
          "headers": httpobj["headers"],
          "auth": httpobj["auth"],
          "followRedirects": true,
          "params": httpobj["params"]
        });
        logger.info("Finished pulp api call");
        var response_json = JSON.parse(response["content"]);
        logger.debug("Search repositories response json: "+response["content"]);
        _.each(response_json, function (repo_data) {
          var repo_id = repo_data['id'];
          if (Meteor.settings.public.rpm_repos.includes(repo_id) || Meteor.settings.public.puppet_repos.includes(repo_id)) {
            logger.info('repo id: ' + repo_id);
            var distributors = repo_data['distributors'];
            _.each(distributors, function (distributor) {
              var distributor_id = distributor['id']
              logger.info('distributor id:' +distributor_id);
              var auto_publish = distributor['auto_publish']
              var last_publish = distributor['last_publish']
              if (distributor_id === 'yum_distributor' || distributor_id === 'puppet_distributor') {
                var relative_url = distributor['config']['relative_url']
                var unit_type = distributor_id === "puppet_distributor" ? "puppet_module" : "rpm"
                var exposed_data = {
                  'repo_id': repo_id,
                  'relative_url': relative_url,
                  'auto_publish': auto_publish,
                  'unit_type': unit_type,
                  'last_publish': last_publish === null ? '' : last_publish
                }
                raw_data.push(exposed_data);
              }
            });

          }
        });
        logger.debug('raw_data:', JSON.stringify(raw_data,null, 2));

        _.each(raw_data, function(repo){
          if (init) {
            self.added('repositories', repo['repo_id'], repo);
          } else {
            self.changed('repositories', repo['repo_id'], repo);
          }
        });
      } catch (error) {
        logger.error(error.message);
        throw new Meteor.Error("Server Side Error:", error.message);
      }
      self.ready();
      init = false;
      return query_repo_data;
    }(), refresh_interval);
  });

}
