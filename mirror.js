/*
  The filesync script uses the WinSCP utility to mirror local project
  directories on remote servers.
*/

// I. Import libraries.

var spawn   = require ('child_process').spawn;
var express = require ('express');
var fs      = require ('fs');
var path    = require ('path');

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

app.use ('/', express.static (path.resolve ('./')));

app.get ('/connections',
  function (request, response) {
    var connections = [];
    CONNECTIONS.forEach (function (connection) {
      connections.push ({
        name:        connection.name,
        status:      connection.status,
        local_path:  connection.local_path,
        remote_path: connection.remote_path,
        remote_host: connection.remote_host,
        remote_user: connection.remote_user
      });
    });

    response.json (connections);
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
  console.log ('Starting a connection to: ' + connection.name + ' ' + WINSCP);
  connection.status = CONNECTION_STATUS_RUNNING;
  connection.process = spawn (WINSCP, ['sftp://' + connection.remote_user + '@' + connection.remote_host, '/privatekey=' + connection.ppkpath, '/keepuptodate', connection.local_path, connection.remote_path, '/defaults']);
  connection.process.stdout.on ('data', function (data) { console.log ('[stdout] ' + data); });
  connection.process.stderr.on ('data', function (data) { console.log ('[stderr] ' + data); });
  connection.process.on ('close', function (code, signal) {
    console.log ('The connection to ' + connection.name + ' has ended. code: ' + JSON.stringify (code));
    code && code !== 0 ?
      connection.status = CONNECTION_STATUS_ERROR :
      connection.status = CONNECTION_STATUS_STOPPED ;
  });
}

function stopConnection (connection) {
  console.log ('Killing process: ' + connection.process.pid);
  connection.process.kill ();
}
