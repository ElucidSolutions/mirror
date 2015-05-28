/*
*/

var CONNECTION_STATUS_ERROR   = 'Error';
var CONNECTION_STATUS_STOPPED = 'Stopped';
var CONNECTION_STATUS_RUNNING = 'Running';

/*
*/
$(document).ready (function () {
  setInterval (
    function () {
      $.getJSON ('/connections',
        function (connections) {
          var tbodyElement = $('#connections-table > tbody');
          tbodyElement.empty ();
          connections.forEach (
            function (connection) {
              tbodyElement.append (renderConnection (connection));
          });
      });
    },
    1000
  );
});

/*
*/
function renderConnection (connection) {
  return $('<tr></tr>')
    .addClass ('connection-row')
    .addClass ('connection-status-' + connection.status)
    .append ($('<td></td>').text (connection.name))
    .append ($('<td></td>').text (connection.status))
    .append ($('<td></td>').text (connection.local_path))
    .append ($('<td></td>').text (connection.remote_path))
    .append ($('<td></td>').text (connection.remote_host))
    .append ($('<td></td>').text (connection.remote_user))
    .append ($('<td></td>')
      .append (
        connection.status === CONNECTION_STATUS_RUNNING ?
          $('<a></a>')
            .attr ('href', new URI ('/stop').addSearch ('name', connection.name))
            .text ('Stop') :
          $('<a></a>')
            .attr ('href', new URI ('/start').addSearch ('name', connection.name))
            .text ('Start')));
}
