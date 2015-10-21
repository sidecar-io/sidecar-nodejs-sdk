"use strict";
var PRODUCTION_MODE = false;

if (PRODUCTION_MODE){
  var developerKeys = exports.developerKeys = {
      // Application Access Keys
      // https://console.sidecar.io/application
      'appKeyId': '',
      'appSecret': '',

      // Testing
      'deviceId': '',
      'userKeyId': '',
      'userSecret': '',

      // GitHub API OAuth
      // https://github.com/settings/developers
      // AWS
      'githubClientID': '',
      'githubClientSecret': '',
      'callbackURL': 'http://yourdomain.com/auth/github/callback'
  };
}
else {
  var developerKeys = exports.developerKeys = {
    // Application Access Keys
    // https://console.sidecar.io/application
    'appKeyId': '',
    'appSecret': '',

    // Testing
    'deviceId': '',
    'userKeyId': '',
    'userSecret': '',

    // GitHub API OAuth
    // https://github.com/settings/developers
    // localhost
    'githubClientID': '',
    'githubClientSecret': '',
    'callbackURL': 'http://localhost/auth/github/callback'
  };
}
