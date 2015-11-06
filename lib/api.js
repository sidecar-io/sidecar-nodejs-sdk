/*
 * Copyright 2015 Qsense, Inc.
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
 // Sidecar API
'use strict'

var request = require('request');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var async = require('async');

var configuration = require('./configure');
var hostURL = 'http://api.sidecar.io';

var authURI = '/rest/v1/provision/application/auth';
var applicationStatusURI =  '/rest/v1/provision/application/status';

// App access keys
var appKeyId = configuration.developerKeys.appKeyId;
var appSecret = configuration.developerKeys.appSecret;

// User access keys
var userKeyId = configuration.developerKeys.userKeyId;
var userSecret = configuration.developerKeys.userSecret;

// User Device ID
var deviceId = configuration.developerKeys.deviceId;

/* REST operations
 *
 * For more information about the Sidecar REST API, please visit http://api.sidecar.io/docs
 *
 */


module.exports = {

  /* Provision a User for a specific Application
   *
   * Provision a user and issues access keys. Application access keys are required.
   * Creates a mobile user using the specified username and password in the request body.
   * A set of access keys for the application and organization are crk11eated for that user.
   *
   */
  provisionUser: function(payload, appKeyId, appSecret, callback){
    payload = JSON.stringify(payload);
    var httpMethod = 'POST';
    var uriPath = '/rest/v1/provision/application/user';
    var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', appSecret).update(toSign).digest('base64')
    request({
      method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ appKeyId + ': ' + signature
    },
    body: payload
  }, function(error, response){
      if(!error){
        callback(error, response);
      }
      else {
        callback(error, response);
        console.log(error);
      }
    });
  },

  /* Obtain user's existing access/secret keys.
   *
   * This request authenticates a user and returns a user's access
   * and secret key for API usage in the response. The requesting user
   * must have been provisioned for this call to succeed.
   *
   */
  getUserKeys: function(payload, appKeyId, appSecret, callback){
    payload = JSON.stringify(payload);
    var httpMethod = 'POST';
    var uriPath = '/rest/v1/provision/application/auth';
    var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', appSecret).update(toSign).digest('base64')
    request({
      method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ appKeyId + ': ' + signature
    },
    body: payload
    }, function(error, response){
        if(!error){
          callback(error, response);
        }
        else {
          callback(error, response);
          console.log(error);
        }
      });
    },

  /* Obtain User's device ID.
   *
   */
  getDeviceId: function(){
    var deviceId = configuration.developerKeys.deviceId;
    return deviceId;
  },

  /* Update User Metadata
   *
   * Creates or overwrites specific user metadata keys pairs found in the request payload.
   * If a key exists in the users current metadata, but does not exist in the
   * keys present in the request, the currently existing key/value will not be modified.
   *
   */
  updateUser: function(payload,userKeyId, userSecret, callback){
    payload = JSON.stringify(payload);
    var httpMethod = 'PUT';
    var uriPath = '/rest/v1/provision/user';
    var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', userSecret).update(toSign).digest('base64')
    request({
      method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ userKeyId + ': ' + signature
    },
    body: payload
    }, function(error, response, body){
      if(response.statusCode == 200 && body != '[]' && body){
        var body = JSON.parse(body);
        callback(error, body);
      }
      else
      {
        console.log('updateUser body: ' + body);
        console.log('updateUser response: ' + response.statusCode);
      }
    });
  },

  /* Publish a new Event
   *
   * An Event is the main object of ingestion for Sidecar and is bound to a particular named stream.
   * The stream is user definable, however it cannot be null or contain whitespaces. The timestamp of the Event should correspond to the datetime that the
   * Event is being transmitted to Sidecar, not the timestamp of the readings. The Event timestamp should not be greater than 15
   * minutes old or the security nanny will reject the request with a firm smackdown.
   *
   * Every event needs to contain a unique id property that conforms to the UUID specification; the producer is responsible for
   * assigning this UUID. Events will be rejected if the UUID is a duplicated.
   *
   */
  publishEvent: function(payload, currentTime, userKeyId, userSecret, callback){
    var httpMethod;
    var uriPath;
    var md5;
    var signatureVersion;
    var toSign;
    var signature;

    async.series([
      function(callback){
        payload = JSON.stringify(payload);
        //console.log('one: ' + md5);
        callback(null, payload);
      },
      function(callback){
        httpMethod = 'POST';
        uriPath = '/rest/v1/event';
        //var currentTime = new Date().toISOString();
        signatureVersion = '1';
        md5 = crypto.createHash('md5').update(payload).digest('hex');
        //console.log('two ' + signature);
        callback(null, md5);
      },
      function(callback){
        toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
        signature = crypto.createHmac('sha1', userSecret).update(toSign).digest('base64');
        //console.log('two ' + signature);
        callback(null, signature);
      },
      function(callback){

        request.post({
          // method: httpMethod,
          url: hostURL + uriPath,
          headers: {
            'Content-Type': 'application/json',
            'Date': currentTime,
            'Signature-Version': '1',
            'Content-MD5': md5,
            'Authorization': 'SIDECAR '+ userKeyId + ': ' + signature
          },
          body: payload
          }, function(error, response, body){
            if(!error){
              var result = body + ' publishEvent response: ' + response.statusCode;
              //callback(error, result, response.statusCode);
              callback(null, result);
              console.log('publishEvent body: ' + result);
              //console.log('publishEvent response: ' + response.statusCode);
            }
            else console.log(error);
        });


        //console.log('three');
        //callback(null, 'three');
      }
    ],
    // optional callback
    function(err, results){

              callback(err, results);
       //console.log(results);
        // results is now equal to ['one', 'two']
    });

  },

  /* Range Query
   *
   * The range query is similar to the latest query in that it returns raw events back, but it allows you to restrict by a "to" and "from" date.
   * If you do not supply a date range, it will default to the the last 24 hours.
   *
   * The range query may include a 'from' and 'to' zoned date-time property as an argument.
   * The query is executed against the Event#ts object property.
   * You may optionally provide a "limit" argument in the query to cap the number of records returned. If no limit is provided it will default to 5.
   * The tags argument is also supported to further filter by Event#tags; you may provide one, or a comma-delimited list of tags.
   *

  queryByDate: function(payload, currentTime, callback){
    var httpMethod = 'POST';
    var uriPath = '/rest/v1/query/user/device/' + deviceId + '/range';
    //var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', userSecret).update(toSign).digest('base64')
    request.post({
      //method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ userKeyId + ': ' + signature
    },
    body: payload
    }, function(error, response, body){
        if(!error){
          var result = body;
          callback(error, result, response.statusCode);
          //console.log('queryByDate body: ' + body);
          //console.log('queryByDate response: ' + response.statusCode);
        }
    });
  },*/
  queryByDate: function(payload, currentTime, userKeyId, userSecret, callback){

    var httpMethod;
    var uriPath;
    var md5;
    var signatureVersion;
    var toSign;
    var signature;

    async.series([
      function(callback){
        payload = JSON.stringify(payload);
        //console.log('one: ' + md5);
        callback(null, payload);
      },
      function(callback){
        httpMethod = 'POST';
        uriPath = '/rest/v1/query/user/device/' + deviceId + '/range';
        //var currentTime = new Date().toISOString();
        signatureVersion = '1';
        md5 = crypto.createHash('md5').update(payload).digest('hex');
        //console.log('two ' + signature);
        callback(null, md5);
      },
      function(callback){
        toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
        signature = crypto.createHmac('sha1', userSecret).update(toSign).digest('base64');
        //console.log('two ' + signature);
        callback(null, signature);
      },
      function(callback){

        request.post({
          // method: httpMethod,
          url: hostURL + uriPath,
          headers: {
            'Content-Type': 'application/json',
            'Date': currentTime,
            'Signature-Version': '1',
            'Content-MD5': md5,
            'Authorization': 'SIDECAR '+ userKeyId + ': ' + signature
          },
          body: payload
          }, function(error, response, body){
            if(!error){
              var result = body;
              //callback(error, result, response.statusCode);
              callback(null, result);
              console.log('queryByDate body: ' + result);
              //console.log('queryByDate response: ' + response.statusCode);
            }
            else console.log(error);
        });
        //console.log('three');
        //callback(null, 'three');
      }
    ],
    // optional callback
    function(err, results){

              callback(err, results);
       //console.log(results);
        // results is now equal to ['one', 'two']
    });

  },



  /* Query Latest Event Data
   *
   * Query the most recent user data, for a specified deviceId, that has been processed for the named stream.
   * A copy of the raw event data will be returned as the answer.
   *
   * You may provide a "limit" argument in the query to cap the number of records returned. If no limit is provided it will default to 5.
   *
   */
  queryLatestEvent: function(payload, currentTime, userKeyId, userSecret, callback){
    var httpMethod = 'POST';
    var uriPath = '/rest/v1/query/user/device/' + deviceId + '/latest';
    var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', userSecret).update(toSign).digest('base64')
    request.post({
      //method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ userKeyId + ': ' + signature
    },
    body: payload
    }, function(error, response, body){
      if(!error){
        var result = body;
        callback(error, result, response.statusCode);
        //console.log('queryLatestEvent body: ' + body);
        //console.log('queryLatestEvent response: ' + response.statusCode);
      }
    });
  },



  /* Stats Query
   *
   * Query the base stats, for all user devices, on a named stream. The stats answer will be returned in a answer bucket.
   * Stats will include count, min, max, average and sum.
   *
   * The query may include a 'from' and 'to' zoned date-time property as an argument. If no date range is provided it will default to a
   * 'from' value of now() - 30 days and a 'to' value of now(). The tags argument is also supported to further filter by Event#tags; you may
   * provide one, or a comma-delimited list of tags.
   *
   */
  queryStats: function(payload, currentTime, userKeyId, userSecret, callback){
    var httpMethod = 'POST';
    var uriPath = '/rest/v1/query/user/device/' + deviceId + '/stats';
    //var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', userSecret).update(toSign).digest('base64')
    request({
      method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ userKeyId + ': ' + signature
    },
    body: payload
    }, function(error, response, body){
      if(!error){
        var result = body;
        callback(error, result, response.statusCode);
        //console.log('queryStats body: ' + body);
        //console.log('queryStats response: ' + response.statusCode);
      }
    });
  },

  /* Sidecar REST API Status
   *
   * The Sidecar REST API status endpoint. Verify the availability of the REST API.
   * You can also use the utcTime property to sync your devices clock before sending events.
   */
  apiStatus: function(callback){
    var statusURI = '/rest/status';
    request({
      method: 'GET',
      url: hostURL + statusURI,
    }, function(error, response, body){
      if(response.statusCode == 200 && body != '[]' && body){
        var response = JSON.parse(body);
        callback(error, response);
      }
      else
      {
        console.log('apiStatus: ' + body);
        console.log("apiStatus response: " + response.statusCode);
      }
    });
  },

  // getUserCountForApplication
  getUserCountForApplication: function(appKeyId, appSecret, callback){
    var payload = "";
    var httpMethod = 'GET';
    var uriPath = '/rest/v1/provision/application/user/count';
    var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', appSecret).update(toSign).digest('base64')
    request({
      method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ appKeyId + ': ' + signature
        }
      }, function(error, response){
      if(!error){
        callback(error, response);
      }
      else {
        callback(error, response);
        console.log(error);
      }
    });
  },

  // getDeviceCountForApplication
  getDeviceCountForApplication: function(appKeyId, appSecret, callback){
    var payload = "";
    var httpMethod = 'GET';
    var uriPath = '/rest/v1/provision/application/device/count';
    var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', appSecret).update(toSign).digest('base64')
    request({
      method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ appKeyId + ': ' + signature
        }
      }, function(error, response){
      if(!error){
        callback(error, response);
      }
      else {
        callback(error, response);
        console.log(error);
      }
    });
  },

  // getDeviceCountForApplication
  getDevicesForUser: function(userKeyId, userSecret,callback){
    var payload = "";
    var httpMethod = 'GET';
    var uriPath = '/rest/v1/provision/user/devices';
    var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', userSecret).update(toSign).digest('base64')
    request({
      method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ userKeyId + ': ' + signature
        }
      }, function(error, response){
      if(!error){
        callback(error, response);
      }
      else {
        callback(error, response);
        console.log(error);
      }
    });
  },


  // Register Device
  registerDevice: function(payload, userKeyId, userSecret, callback){
    payload = JSON.stringify(payload);
    var httpMethod = 'POST';
    var uriPath = '/rest/v1/provision/user/device';
    var currentTime = new Date().toISOString();
    var md5 = crypto.createHash('md5').update(payload).digest('hex');
    var signatureVersion = '1';
    var toSign = httpMethod + '\n' + uriPath + '\n' + currentTime + '\n' + md5 + '\n' + signatureVersion;
    var signature = crypto.createHmac('sha1', userSecret).update(toSign).digest('base64')
    request({
      method: httpMethod,
      url: hostURL + uriPath,
      headers: {
        'Content-Type': 'application/json',
        'Date': currentTime,
        'Signature-Version': '1',
        'Content-MD5': md5,
        'Authorization': 'SIDECAR '+ userKeyId + ': ' + signature
    },
    body: payload
  }, function(error, response){
      if(!error){
        callback(error, response);
      }
      else {
        callback(error, response);
        console.log(error);
      }
    });
  }

};
