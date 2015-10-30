/**************************************************************
                        2015 FreeMarketLite
**************************************************************/
/**
 * Module dependencies.
 **/
debug = false;

var nxtHost = "http://127.0.0.1";
var nxtPort = 7876;
var fmUrl = "http://127.0.0.1:17776/nxtpass";

if(debug) nxtPort = 6876;
var nxtUrl = nxtHost + ":" + nxtPort + "/nxt";

var express = require('express');
var https = require('https');
var http = require('http');
var path = require('path');
var request = require('request');
var fs = require('fs');

var app = express();
var httpApp = express();

var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// ssl cert
var sslOptions = {};

if(!debug)
{
  sslOptions = {
    key: fs.readFileSync(__dirname + '/../ssl/freemarketlite.key'),
    cert: fs.readFileSync(__dirname + '/../ssl/freemarketlite_cc.crt'),
    ca: [
        fs.readFileSync(__dirname + '/../ssl/AddTrustExternalCARoot.crt'),
        fs.readFileSync(__dirname + '/../ssl/COMODORSAAddTrustCA.crt'),
        fs.readFileSync(__dirname + '/../ssl/COMODORSADomainValidationSecureServerCA.crt')
    ],
	
    requestCert: true,
    rejectUnauthorized: false
  };
}


// all environments
app.set('port', process.env.PORT || 443); //std https port
if(debug) app.set('port', process.env.PORT || 8008); //std http port

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// all environments
httpApp.set('port', process.env.PORT || 8008); //std http port
httpApp.use(express.favicon());
httpApp.use(express.logger('dev'));
httpApp.use(express.json()); // to support JSON-encoded bodies
httpApp.use(express.urlencoded()); // to support URL-encoded bodies
httpApp.use(express.methodOverride());
httpApp.use(httpApp.router);
httpApp.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
console.log('Welcome to NxT FreeMarket Lite Browser!');

/**
 *Create Server and router
 **/

var server = undefined;
if(debug)
{
  server = http.createServer(app);
}
else
{
  server = https.createServer(sslOptions,app);
}

//start socket.io
var io = require('socket.io').listen(server);


server.listen(app.get('port'), function(err, result) {
    console.log('Express server listening on port ' + app.get('port'));
});

if(!debug)
{
  // set up plain http server
  var redirect = http.createServer(httpApp);

  // have it listen on 80
  redirect.listen(80);
}


/**
 *routes
 **/

// Pass through to FM core
app.post('/nxtpass', function(req,res) {

  request.post(fmUrl, {form : req.body}, function(e){
    if(e) console.log(e);
  }).pipe(res);

});

httpApp.get('*', function(req, res) {
    res.redirect('https://www.freemarketlite.cc'+req.url)
});

/**
 *socket.io
 **/
io.sockets.on('connection', function(socket) {

    console.log('connection from ' + socket.request.connection.remoteAddress);

});

////END SOCKET.IO


/**
 * API
 **/
//Return JSON-formatted string of all current FreeMarket listings

app.get('/all_listings', function(req, res) {
});
