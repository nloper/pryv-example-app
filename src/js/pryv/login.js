/* global module, require */

var pryv = require('pryv');
  
var info = require('./info'),
  monitor = require('./monitor'),
  display = require('./../utils/display'),
  config = require('../../../config.json');

module.exports.pryvLogin = function (callback) {
  var connection = null,
    settings = {
      requestingAppId: 'javascript-example-app',
      requestedPermissions: config.pryv.permissions,
      returnURL: false,
      spanButtonID: 'pryv-button',
      callbacks: {
        initialization: function () {
          display.printToConsole('-> Authentication initialized...');
        },
        needSignin: function (popupUrl, pollUrl, pollRateMs) {
          display.printToConsole('...please sign-in...');
          if (!popupUrl || !pollUrl || !pollRateMs) {
            display.printError('Something went wrong while trying to authenticate.' + '\n');
          }
          callback(null);
        },
        signedIn: function (settings) {
          connection = new pryv.Connection(settings);
          connection.fetchStructure(function (err) {
            if (err) { display.printError(err); }
          });
          display.printToConsole('...access granted for user ' + settings.username +
            ' with following token: ' +  settings.auth + '.');
          info.showStreamTree(connection);
          info.showAccessInfo(connection);
          monitor.setupMonitor(connection);
          callback(connection);
        },
        refused: function (code) {
          display.printToConsole('...access refused: ' + code + '\n');
          callback(null);
        },
        error: function (code, message) {
          display.printToConsole('...error [' + code + ']: ' + message + '\n');
          callback(null);
        }
      }
    };

  pryv.Auth.config.registerURL.host = 'reg.' + config.pryv.domain;
  pryv.Auth.setup(settings);
};