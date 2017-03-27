/*global PulpAuthToken:true Buffer:ture logger*/
var path = require('path')

if (Meteor.isServer) {
  Meteor.startup(function () {
    if(Meteor.settings.public.disable_auth!==true) {
      ServiceConfiguration.configurations.upsert(
        {service: 'oidc'},
        {
          $set: {
            loginStyle: Meteor.settings.oidc.loginStyle,
            clientId: Meteor.settings.oidc.clientId,
            secret: Meteor.settings.oidc.clientSecret,
            serverUrl: Meteor.settings.oidc.serverUrl,
            authorizationEndpoint: Meteor.settings.oidc.authorizationEndpoint,
            tokenEndpoint: Meteor.settings.oidc.tokenEndpoint,
            userinfoEndpoint: Meteor.settings.oidc.userinfoEndpoint,
            idTokenWhitelistFields: Meteor.settings.oidc.idTokenWhitelistFields || ['realm_access']
          }
        }
      );
    }

    console.log("Pulpman startup ...");
    //PulpAuthToken = new Buffer(Meteor.settings.admin_user + ':' + Meteor.settings.admin_password).toString('base64');
    var winston = Winston;
    var log_path = Meteor.settings.logpath ? Meteor.settings.logpath : 'pulpman.log';
    var log_level = Meteor.settings.log_level ? Meteor.settings.log_level: 'info';
    console.log("Setting logleve to " + log_level);

    if(!path.isAbsolute(log_path)) {
      //https://github.com/winstonjs/winston/issues/90
      //use absolute path for log_path
      log_path = path.join(path.resolve('./') , log_path);
    }
    console.log("Log path: " + log_path);
    logger = new(winston.Logger)({
      transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
          filename: log_path,
          maxFiles: 5,
          maxSize: 1024000
        })
      ]
    });
    logger.level = log_level;
    if (Meteor.isProduction) {
      logger.remove(winston.transports.Console);
    } else {
      logger.remove(winston.transports.File);
    }

  });
}



if(Meteor.isServer) {
  Meteor.publish("userData", function () {
    console.log("publish user data: ", this.userId)
    if (this.userId) {
      return Meteor.users.find({_id: this.userId},
        {fields: {'services': 1}});
    }else {
      this.ready()
    }
  });
}

import '../imports/api/util.js';
import '../imports/api/modules.js';
import '../imports/api/rpms.js';
import '../imports/api/repositories';


