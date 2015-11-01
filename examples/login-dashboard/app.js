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

var express = require('express');
var util = require('util');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var partials = require('express-partials');
var uuid = require('node-uuid');

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var config = require('./config');

var sidecar = require('../../lib/api');
var configuration = require('../../lib/configure');
// Sidecar Global Config
var appKeyId = configuration.developerKeys.appKeyId;
var appSecret = configuration.developerKeys.appSecret;
var supportEmail = configuration.developerKeys.supportEmail;
var yourName = configuration.developerKeys.yourName;
var panel = config.dashboard.getPanels();


var countEvents = 0;
var countEventsPrevious = 0;
var numberOfitems = 0;
var loginFlag = false;
var registerFlag = false;
var adminFlag = false;
var invalidUser = false;
var invalidRegister = false;
var invalidAdmin = false;
var errorMessage;
var errorAdminMessage = "Invalid Credentials";
var isAdminUser = false;
var isUser = false;

// TO DO: Implement logic for multiple session users using unique identifiers
// TO DO: Implement 'isAdminUser' security + uuid

var userKeyId;
var userSecret;
var deviceId;
var uuidSession;

function provisionUser(username, password, callback){
  var data = {
    username:username,
    password:password
  };
  sidecar.provisionUser(data, function(err, result){
    callback(null, result);
  });
}

function getUserKeys(username, password, callback){
  var data = {
    username: username,
    password: password
  };
  sidecar.getUserKeys(data, function(err, result){
    callback(null, result);
  });
}

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      if(loginFlag){ // End-User Login
        //Login Sidecar User using form username and password
        getUserKeys(username, password, function(err, result) {

          if(result.statusCode == 200)
          {

            body = JSON.parse(result.body);
            userKeyId = body.keyId;
            userSecret = body.secret;

            console.log('getUserKeys keyId:' + userKeyId);
            console.log('getUserKeys secret:' + userSecret);
            console.log('getUserKeys statusCode:' + result.statusCode);

            invalidUser = false;
            invalidRegister = false;
            isUser = true;
            return done(null, username);
          }
          else {

            console.log('provisionUser body:' + result.body);
            console.log('provisionUser statusCode:' + result.statusCode);

            invalidUser = true;
            invalidRegister = false;
            errorMessage = result.body;
            isUser = false;
            return done(null, null);
          }
        });
      }
      if (registerFlag) { // End-User Register
        //Provision Sidecar User using form username and password
        provisionUser(username, password, function(err, result) {

          if(result.statusCode == 200){

            body = JSON.parse(result.body);
            userKeyId = body.keyId;
            userSecret = body.secret;
            console.log('getUserKeys keyId:' + userKeyId);
            console.log('getUserKeys secret:' + userSecret);
            console.log('getUserKeys statusCode:' + result.statusCode);

            invalidRegister = false;
            invalidUser = false;
            isUser = true;
            return done(null, username);
          }
          else {
            body = JSON.parse(result.body);
            console.log('provisionUser body:' + body.message);
            console.log('provisionUser statusCode:' + result.statusCode);

            errorMessage = body.message;
            invalidRegister = true;
            invalidUser = false;
            isUser = false;
            return done(null, null);
          }
        });
      }
      if (adminFlag) { // Admin/Developer Login to admin-dashboard
        db.adminUsers.findByUsername(username, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            invalidAdmin = true;
            errorAdminMessage  = 'Invalid username'
            isAdminUser = false;
            isUser = false;
            return done(null, false);
          }
          if (user.password != password) {
            invalidAdmin = true;
            errorAdminMessage  = 'Invalid Password'
            isAdminUser = false;
            isUser = false;
            return done(null, false);
          }
          isAdminUser = true;
          isUser = true;
          invalidAdmin = false;
          return done(null, user);
        });
      }
    });
  }));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(username, done) {
  done(null, username);
});

passport.deserializeUser(function(username, done) {
  done(null, username);
});

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({
  genid: function(req) {
    uuidSession = uuid.v1();
    console.log(uuidSession);
    return uuidSession // use UUIDs for session IDs
  },
  secret: 'keyboard cat'
}))
//app.use(session({ secret: 'keyboard cat' }));
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){

  loginFlag = true;
  registerFlag = false;
  adminFlag = false;

  invalidRegister = false;
  invalidAdmin = false;

  if(!isUser){
    res.render('index', { user: req.user, invalidUser: invalidUser, errorMessage: errorMessage });
  }
  else {
    res.render('index', { user: req.user, invalidUser: invalidUser, isAdminUser:isAdminUser, panel:panel });
  }

});

app.get('/register', function(req, res){

  loginFlag = false;
  registerFlag = true;
  adminFlag = false;

  invalidUser = false;
  invalidAdmin = false;

  res.render('register', { user: req.user, invalidRegister: invalidRegister, errorMessage:errorMessage });

});

app.get('/admin', function(req, res){

  loginFlag = false;
  registerFlag = false;
  adminFlag = true;

  invalidUser = false;
  invalidRegister = false;

  res.render('admin', {
    user: req.user,
    invalidAdmin: invalidAdmin,
    errorAdminMessage: errorAdminMessage
  });

});

app.get('/account', require('connect-ensure-login').ensureLoggedIn(), function(req, res){

  loginFlag = true;
  registerFlag = false;
  adminFlag = false;

  res.render('account', { user: req.user });

});

app.get('/admin-dashboard', require('connect-ensure-login').ensureLoggedIn(), function(req, res){

  loginFlag = false;
  registerFlag = false;
  adminFlag = true;

  if(isAdminUser) {
    res.render('admin-dashboard', {
      user: req.user,
      isAdminUser: isAdminUser,
      invalidAdmin: invalidAdmin,
      errorAdminMessage: errorAdminMessage,
      appKeyId: appKeyId,
      appSecret: appSecret,
      supportEmail: supportEmail,
      yourName: yourName,
      panel:panel
    });
  }
  else { res.render('admin', { user: req.user, invalidAdmin: invalidAdmin, errorAdminMessage:errorAdminMessage }); }

});

app.get('/login', function(req, res){

  loginFlag = true;
  registerFlag = false;
  adminFlag = false;

  invalidRegister = false;
  invalidAdmin = false;

  if(!isUser){
    res.render('index', { user: req.user, invalidUser: invalidUser, errorMessage: errorMessage });
  }
  else {
    res.render('index', { user: req.user, invalidUser: invalidUser, panel:panel });
  }
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.post('/register',
  passport.authenticate('local', { failureRedirect: '/register' }),
  function(req, res) {
    res.redirect('/');
});

app.post('/admin',
  passport.authenticate('local', { failureRedirect: '/admin' }),
  function(req, res) {
    console.log(req.body.username);
    res.redirect('/admin-dashboard');
});

app.post('/globalConfig', require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    appKeyId = req.body.appKeyId;
    appSecret = req.body.appSecret;
    supportEmail = req.body.supportEmail;
    yourName = req.body.yourName;
    res.redirect('/admin-dashboard');
});

app.post('/panel1', require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    if(req.body.enablePanel1 == 'on') { panel[0].enable = 'true'; }
    else { panel[0].enable = 'false'; }
    panel[0].panelName = req.body.panelName1;
    panel[0].variable1 = req.body.panel1value1;
    panel[0].variable2 = req.body.panel1value2;
    panel[0].graphType = req.body.graphType1;
    if(req.body.graphType1 == 'line'){
      panel[0].lineEnable = 'true';
      panel[0].barEnable = 'false';
    }
    else {
      panel[0].lineEnable = 'false';
      panel[0].barEnable = 'true';
    }
    res.redirect('/admin-dashboard#panel1');
});

app.post('/panel2', require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    if(req.body.enablePanel2 == 'on') { panel[1].enable = 'true'; }
    else { panel[1].enable = 'false'; }
    panel[1].panelName = req.body.panelName2;
    panel[1].variable1 = req.body.panel2value1;
    panel[1].variable2 = req.body.panel2value2;
    panel[1].graphType = req.body.graphType2;
    if(req.body.graphType2 == 'line'){
      panel[1].lineEnable = 'true';
      panel[1].barEnable = 'false';
    }
    else {
      panel[1].lineEnable = 'false';
      panel[1].barEnable = 'true';
    }
    res.redirect('/admin-dashboard#panel2');
});

app.post('/panel3', require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    if(req.body.enablePanel3 == 'on') { panel[2].enable = 'true'; }
    else { panel[2].enable = 'false'; }
    panel[2].panelName = req.body.panelName3;
    panel[2].variable1 = req.body.panel3value1;
    panel[2].variable2 = req.body.panel3value2;
    panel[2].graphType = req.body.graphType3;
    if(req.body.graphType3 == 'line'){
      panel[2].lineEnable = 'true';
      panel[2].barEnable = 'false';
    }
    else {
      panel[2].lineEnable = 'false';
      panel[2].barEnable = 'true';
    }
    res.redirect('/admin-dashboard#panel3');
});

app.post('/panel4', require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    if(req.body.enablePanel4 == 'on') { panel[3].enable = 'true'; }
    else { panel[3].enable = 'false'; }
    panel[3].panelName = req.body.panelName4;
    panel[3].variable1 = req.body.panel4value1;
    panel[3].variable2 = req.body.panel4value2;
    panel[3].graphType = req.body.graphType4;
    if(req.body.graphType4 == 'line'){
      panel[3].lineEnable = 'true';
      panel[3].barEnable = 'false';
    }
    else {
      panel[3].lineEnable = 'false';
      panel[3].barEnable = 'true';
    }
    res.redirect('/admin-dashboard#panel4');
});


app.get('/logout', function(req, res){
  loginFlag = true;
  registerFlag = false;
  adminFlag = false;

  isAdminUser = false;
  isUser = false;

  req.logout();
  res.redirect('/');
});

app.listen(80);


setInterval(function() {

},1000);
