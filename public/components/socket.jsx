var port = "";
if(window.location.port) {
  port = ":" + window.location.port;
}
var socket = io("//"+window.location.hostname + port);
//socket.emit("authenticate", "kieran", "defaultpassword");

export default socket;
