//const React = require("react");
import React from "react";
import { render } from "react-dom";
import { Provider, connect } from "react-redux";
import File from "./components/File.jsx";
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

render(<Container/>, document.querySelector(".app"));
