var express = require('express');
var sidecar = require('../lib/api');
var uuid = require('node-uuid');
var gpio = require('onoff').Gpio;

var app = express();

var led = new gpio(15, 'out');

var toggleLed = 0;

setInterval(function() {
  toggleLed = toggleLed + 1;
  if(toggleLed==2) toggleLed=0;
  led.writeSync(toggleLed);
},1000);




