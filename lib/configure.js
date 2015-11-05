/*
 * Copyright 2015 Sidecar.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

"use strict";

var PRODUCTION_MODE = false;

// Production Mode
if (PRODUCTION_MODE){
  var developerKeys = exports.developerKeys = {
      // Application Access Keys
      // https://console.sidecar.io/application
      'appKeyId': 'UIXZGZXAOE3QRUX4KPWI',
      'appSecret': 'wYGvVPgX8t4qz0RmRlltgFRe5JYBH2rpLtxrqvWM',

      'adminUserKeyId': '',
      'adminUserSecret': '',

      // Testing
      'deviceId': '8f80e970-6b57-11e4-9803-0800200c9a88',
      'userKeyId': 'YNIAI+WHKTXU9FHW03HI',
      'userSecret': 'peylbrcvnixbCD0w0sh422vuzQxzObFLMMJZpQWL',

      // GitHub API OAuth
      // https://github.com/settings/developers
      // AWS
      'githubClientID': '0c3e9923a586da58e08e',
      'githubClientSecret': '6257f2d2d4876554edfdf63fde0da432ae6c33fa',
      'callbackURL': 'http://ec2-52-11-240-173.us-west-2.compute.amazonaws.com/auth/github/callback',

      'adminEmail':'hi@mywebapp.io',
      'yourName':'Admin',
      'adminPassword':'root1234'
  };
}
// Development Mode
else {
  var developerKeys = exports.developerKeys = {
    // Application Access Keys
    // https://console.sidecar.io/application
    'appKeyId': 'UIXZGZXAOE3QRUX4KPWI',
    'appSecret': 'wYGvVPgX8t4qz0RmRlltgFRe5JYBH2rpLtxrqvWM',

    'adminUserKeyId': '',
    'adminUserSecret': '',

    // Testing
    'deviceId': '8f80e970-6b57-11e4-9803-0800200c9a88',
    'userKeyId': 'YNIAI+WHKTXU9FHW03HI',
    'userSecret': 'peylbrcvnixbCD0w0sh422vuzQxzObFLMMJZpQWL',

    // GitHub API OAuth
    // https://github.com/settings/developers
    // localhost
    'githubClientID': 'b43d3b6cd88dd66594ab',
    'githubClientSecret': '6e06d70c546cb65c3dda183b855c6d72a6e91d72',
    'callbackURL': 'http://localhost/auth/github/callback',

    'adminEmail':'hi@mywebapp.io',
    'yourName':'Admin',
    'adminPassword':'root1234'
  };
}
