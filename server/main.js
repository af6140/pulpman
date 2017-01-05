/*global PulpAuthToken:true Buffer:ture logger*/

if (Meteor.isServer) {
  Meteor.startup(function () {
    console.log("Pulpman startup ...");
    PulpAuthToken = new Buffer(Meteor.settings.admin_user + ':' + Meteor.settings.admin_password).toString('base64');
    var winston = Winston;
    var log_path = Meteor.settings.logpath ? Meteor.settings.logpath : 'pulmpman.log';
    var log_level = Meteor.settings.log_level ? Meteor.settings.log_level: 'info';
    console.log("Log path: " + log_path);
    logger = new(winston.Logger)({
      level: log_level,
      transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
          filename: log_path,
          maxFiles: 5,
          maxSize: 1024
        })
      ]
    });
    if (Meteor.isProduction) {
      logger.remove(winston.transports.Console);
    } else {
      logger.remove(winston.transports.File);
    }
  });
}

ServiceConfiguration.configurations.upsert(
  { service: 'oidc' },
  {
    $set: {
      loginStyle: Meteor.settings.oidc.loginStyle,
      clientId: Meteor.settings.oidc.clientId,
      secret: Meteor.settings.oidc.clientSecret,
      serverUrl: Meteor.settings.oidc.serverUrl,
      authorizationEndpoint: Meteor.settings.oidc.authorizationEndpoint,
      tokenEndpoint: Meteor.settings.oidc.tokenEndpoint,
      userinfoEndpoint: Meteor.settings.oidc.userinfoEndpoint
    }
  }
);
import '../imports/api/util.js';
import '../imports/api/modules.js';
import '../imports/api/rpms.js';
