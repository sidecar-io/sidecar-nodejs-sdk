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

var uuid = require('node-uuid');
var request = require('request');
var crypto = require('crypto');
var hostURL = 'http://api.sidecar.io';

// User access keys
var userKeyId = "";
var userSecret = "";

// User Device ID
var deviceId = "";

setInterval(function() {
  sendSensorData();
},1000); //Set Sample Rate (ms)

var sensorData1 = 0;
var sensorData2 = 0;
var currentTimePublish = new Date().toISOString();
var userUuid = uuid.v1();

function sendSensorData(){
  userUuid = userUuid;
  currentTimePublish = new Date().toISOString();
  sensorData1 = Math.floor((Math.random() * 39) + 25);  //Replace this with your own sensor data 1
  console.log("sensor1: " + sensorData1);
  sensorData2 = Math.floor((Math.random() * 32) + 23); //Replace this with your own sensor data 2
  console.log("sensor2: " + sensorData2);
  var data = {
    id: userUuid,
    deviceId: deviceId,
    ts: currentTimePublish,
    stream: 'sensors-stream',
    readings:[
      {
        key: 'sensor1',
        ts: currentTimePublish,
        value: sensorData1
      },
      {
        key: 'sensor2',
        ts: currentTimePublish,
        value: sensorData2
      }
    ],
    location: {
      lat: 11.222,
      lon: 24.111
    }
  };
  publishEventToSidecar(data, currentTimePublish,  function(err, result) {
    console.log('statusCode:' + result.statusCode);
    console.log('statusCode:' + result.body);
  });
}

function publishEventToSidecar(payload, currentTime, callback){
  payload = JSON.stringify(payload);
  var httpMethod = 'POST';
  var uriPath = '/rest/v1/event';
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
