/*
 * Copyright 2015 Qsense
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

var express = require('express');
var sidecar = require('../../lib/api');
var uuid = require('node-uuid');

var app = express();
var bodyParser = require('body-parser');

var consoleCode;

var currentTimeQuery= new Date().toISOString();
var query = {
  stream: 'sensors-stream',
  args: [
      {
        key: 'limit',
        value: '20'
      }
  ]
}
query = JSON.stringify(query);
sidecar.queryLatestEvent(query, currentTimeQuery, function(err, result, responseCode) {
  console.log('0. queryLatestEvent: ' + responseCode);
  result = JSON.parse(result);
  var numberOfRecords = result[0].answer.events.length;
  for(var i=0; i<numberOfRecords; i++){
    console.log(result[0].answer.events[i].readings[0].value);
  }
});

var countEvents = 0;
var countEventsPrevious = 0;
var numberOfitems = 0;

setInterval(function() {
  publishEvent();
},1000);

var sensorData;
var userUuid;
var currentTimePublish = new Date().toISOString();

function publishEvent(){
  userUuid = uuid.v1();
  currentTimePublish = new Date().toISOString();
  sensorData = Math.floor((Math.random() * 39) + 25);
  var data = {
    id: userUuid,
    deviceId: '8f80e970-6b57-11e4-9803-0800200c9a66',
    ts: currentTimePublish,
    stream: 'sensors-stream',
    readings:[
      {
        key: 'sensor1',
        ts: currentTimePublish,
        value: sensorData
      }
    ],
    location: {
      lat: 15.222,
      lon: 25.111
    }
  };
  sidecar.publishEvent(data, currentTimePublish,  function(err, result) {
    consoleCode=result;
    console.log('body:' + consoleCode);
  });
}


var consoleCodeQuery = ' Range Query Endpoint call disabled';
/*

var currentTimeQuery = new Date().toISOString();
//var currentTimeQuery = new Date();
//currentTimeQuery.setSeconds(currentTimeQuery.getSeconds() - 10);
//currentTimeQuery = currentTimeQuery.toISOString();
console.log('hey: ' +currentTimeQuery);

var latestTimeNew = currentTimeQuery;
console.log(latestTimeNew);

setTimeout(function() {
  currentTimeQuery = new Date().toISOString();
  //console.log(currentTimeQuery);
  setInterval(function() {
    queryByDate();
  },1000);

}, 500);

function queryByDate(){
  //currentTimeQuery = new Date().toISOString();
  currentTimeQuery = new Date();
  currentTimeQuery.setSeconds(currentTimeQuery.getSeconds() - 5);
  currentTimeQuery = currentTimeQuery.toISOString();
  console.log('to: ' + currentTimeQuery);
  var queryDate = {
    stream: 'sensors-stream',
    args: [
      {
        key: 'from',
        value: latestTimeNew
      },
      {
        key: 'to',
        value: currentTimeQuery
      },
      {
        key: 'limit',
        value: '1'
      }
    ]
  }
  sidecar.queryByDate(queryDate, currentTimeQuery,  function(err, result, responseCode) {

    consoleCodeQuery=result;
    console.log('consoleCode:' + consoleCodeQuery);


  });
};

*/

app.use(express.static('dashboard'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Sidecar app listening at http://%s:%s', host, port);
});

setInterval(function() {
  app.get('/getdata', function (req, res) {
    res.send(sensorData.toString());
  });

  app.get('/getdataConsole', function (req, res) {
    res.send(consoleCode.toString());
  });

  app.get('/getdataConsoleQuery', function (req, res) {
    res.send(consoleCodeQuery.toString());
  });
},1000)
