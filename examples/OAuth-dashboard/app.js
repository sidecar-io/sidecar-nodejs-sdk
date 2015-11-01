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

 /*
  * OAuth for Sidecar is stil in development.
  */

var express = require('express');
var passport = require('passport');
var util = require('util');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var GitHubStrategy = require('passport-github2').Strategy;
var partials = require('express-partials');
var uuid = require('node-uuid');
var generatePassword = require('password-generator');

var sidecar = require('../../lib/api');
var configuration = require('../../lib/configure');

var GITHUB_CLIENT_ID = configuration.developerKeys.githubClientID;
var GITHUB_CLIENT_SECRET = configuration.developerKeys.githubClientSecret;
var GITHUB_CALLBACK_URL = configuration.developerKeys.callbackURL;

var consoleCode;

var countEvents = 0;
var countEventsPrevious = 0;
var numberOfitems = 0;

setInterval(function() {
  //publishEvent();
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
    deviceId: sidecar.getDeviceId(),
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

/*
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
*/

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.

      console.log(accessToken);
      console.log(refreshToken);
      //Provision Sidecar User using GitHub Username + Random Password
      var username = profile.username;
      var password = generatePassword(27,false);
      var email = profile.emails[0].value;
      console.log('username: ' + username);
      console.log('password: ' + password);
      console.log('email: ' + email);
      provisionUser(username, password);
      return done(null, profile);
    });
  }
));

function provisionUser(username, password){
  var data = {
    username:username,
    password:password
  };
  sidecar.provisionUser(data,  function(err, result, responseCode) {
    consoleCode=result;
    console.log('body:' + consoleCode);
    if(responseCode == 409) getUserMetadata(username); //getUserKeys(username, password);
    else console.log("NUEVON");
  });
}

function getUserKeys(username, password){
  var data = {
    username: username,
    password: password
  };
  sidecar.getUserKeys(data,  function(err, result) {
    consoleCode=result;
    console.log('body:' + consoleCode);
  });
}

function getUserMetadata(username){
  var data = {
    username: username
  };
  sidecar.getUserMetadata(username, data,  function(err, result) {
    consoleCode=result;
    console.log('body:' + consoleCode);
  });
}



var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHub will redirect the user
//   back to this application at /auth/github/callback
app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(80);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
