//const React = require("react");
import React from "react";
import { render } from "react-dom";
import { Provider, connect } from "react-redux";
import File from "./components/File.jsx";
import socket from "./components/socket.jsx";
import Container from "./components/Container.jsx";
//const ReactDOM = require("react-dom");
//const Codemirror = require("react-codemirror");

console.log("Hello world");




/*

var cols = xterm.cols;
var rows = xterm.rows;
xterm.resize(cols, rows+1);
xterm.resize(cols, rows);
socket.emit("size", {cols: cols, rows: rows});

xterm.on("resize", function(size) {
  socket.emit("size", {cols:size.cols, rows: size.rows});
});

/*
socket.on("tree", function(tree) {
  ReactDOM.render(<Bob files={tree}/>, document.getElementById("remainder"));
  ReactDOM.render(<Cindy/>, document.querySelector(".cindy"));
  console.log(tree);
});
*/

/**/

function getQueryStringValue (key) {
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

var secrets = require("../secret.json");
console.log(secrets);

if(getQueryStringValue("code")) {
  var code = getQueryStringValue("code");
  socket.emit("authenticate", code);
  render(<Container/>, document.querySelector(".app"));
} else {
  window.location = ("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=" + secrets.applicationId + "&amp;response_type=code&amp;domain_hint=whsb.essex.sch.uk&amp;redirect_uri=" + secrets.redirectURI + "&amp;scope=User.Read&amp;response_mode=query&amp;nonce=2b439a22-ebc3-46e8-8311-320e83666600&amp;state=abcd").replace(/&amp;/g, '&');
}
