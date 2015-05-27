/*
  The filesync script uses the WinSCP utility to mirror local project
  directories on remote servers.
*/
var exec    = require ('child_process').exec;
var fs       = require ('fs');

// Parses the configuration files.
var getConfig = function (success) {
  fs.readFile ('mirror.json', 'utf8', function (err, data) {
    if (err) { throw err; }
    success (JSON.parse (data));
  });
};

// Mirrors the project directories on the remote server.
var mirror = function () {
  getConfig (function (config) {
    console.log ('Configuration: ' + JSON.stringify (config));
    config.projects.forEach (function (project) {
      var cmd = '"' + config.winscp + '" /command "open sftp://' + project.user + '@' + project.host + ' -privatekey=""' + project.ppkpath + '""" "keepuptodate ""' + project.localpath + '"" ""' + project.remotepath + '"" -filemask=""|.git/"" -delete"';
      console.log ('Executing: ' + cmd);
      var child = exec (cmd, function (error, stdout, stderr) {
        if (error) { throw (error); }
        console.log ('[' + project.name + '] Mirroring ' + project.name + "...");
        console.log ('[' + project.name + "] stdout: '" + stdout + "'.");
        console.log ('[' + project.name + "] stderr: '" + stderr + "'.");
      });
    });
  });
};

// Mirror the project directories on the remote server.
mirror ();
