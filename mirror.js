/*
  The filesync script uses the WinSCP utility to mirror local project
  directories on remote servers.
*/

// I. Import libraries.

var exec    = require ('child_process').exec;
var express = require ('express');
var fs      = require ('fs');
var hamlet  = require ('hamlet').hamlet; 

// II. Set global variables.

var CONNECTION_STATUS_ERROR   = 'Error';
var CONNECTION_STATUS_STOPPED = 'Stopped';
var CONNECTION_STATUS_RUNNING = 'Running';

var CONFIG_FILE_PATH = 'mirror.json';
var WINSCP = 'WinSCP';
var CONNECTIONS = [];

// III. Start the Mirroring Service.

(function () {
  // 1. Read the configuration file.
  fs.readFile (CONFIG_FILE_PATH, 'utf8',
    function (error, file) {
      if (error) { throw new error; }

      // 2. Parse the configuration file.
      var settings = JSON.parse (file);
      WINSCP = settings.winscp;
      CONNECTIONS = settings.connections;

      // 3. Start each connection.
      CONNECTIONS.forEach (startConnection);
  });
}) ();

// IV. Create the User Interface.

var app = express ();
app.listen (3000);

app.use ('/', express.static (__dirname));

app.get ('/connections',
  function (request, response) {
    response.json (CONNECTIONS);
});

app.get ('/start',
  function (request, response) {
    var connectionName = request.query.name;
    var connection = getConnectionByName (connectionName);
    if (connection && connection.status != CONNECTION_STATUS_RUNNING) {
      startConnection (connection);
    }
    response.location ('/');
});

app.get ('/stop',
  function (request, response) {
    var connectionName = request.query.name;
    var connection = getConnectionByName (connectionName);
    if (connection && connection.status === CONNECTION_STATUS_RUNNING) {
      stopConnection (connection);
    }
    response.location ('/');
});

function getConnectionByName (name) {
  for (var i = 0; i < CONNECTIONS.length; i ++) {
    var connection = CONNECTIONS [i];
    if (connection.name === name) {
      return connection;
    }
  }
  return null;
}

function startConnection (connection) {
  var cmd = '"' + WINSCP + '" /command "open sftp://' + connection.remote_user + '@' + connection.remote_host + ' -privatekey=""' + connection.ppkpath + '""" "keepuptodate ""' + connection.local_path + '"" ""' + connection.remote_path + '"" -filemask=""|.git/"" -delete"';
  connection.status = CONNECTION_STATUS_RUNNING;
  connection.process = exec (cmd, function (error, stdout, stderr) {
    error ? connection.status = CONNECTION_STATUS_ERROR:
	    connection.status = CONNECTION_STATUS_STOPPED;
  });
}

function stopConnection (connection) {
  connection.process.kill ();
}
