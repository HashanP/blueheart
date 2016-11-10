import React from "react";
import socket from "./socket.jsx";

export default class Term extends React.Component {
  render() {
    return (
      <div className="terminal2" id="hello"></div>
    );
  }

  componentDidMount() {
    this.xterm = new Terminal();
    this.xterm.open(document.getElementById("hello"));
    this.xterm.fit();
    var xterm = this.xterm;
    console.log("WUUPS2");
    socket.on("output", function (data) {
    //  xterm._pushToBuffer(data);
      xterm.write(data);
    });

    socket.on("clear", function () {
    //  xterm._pushToBuffer(data);
      xterm.clear();
    });

    xterm._flushBuffer = function () {
      xterm.write(xterm._attachSocketBuffer);
      xterm._attachSocketBuffer = null;
      clearTimeout(xterm._attachSocketBufferTimer);
      xterm._attachSocketBufferTimer = null;
    };

    xterm.clear = function() {
      if (this.ybase === 0 && this.y === 0) {
        // Don't clear if it's already clear
        return;
      }
      this.lines = [this.lines[this.ybase + this.y]];
      this.ydisp = 0;
      this.ybase = 0;
      this.y = 0;
      for (var i = 1; i < this.rows; i++) {
        this.lines.push(this.blankLine());
      }
      this.refresh(0, this.rows - 1);
      this.emit('scroll', this.ydisp);
    };

    xterm._pushToBuffer = function (data) {
      if (xterm._attachSocketBuffer) {
        xterm._attachSocketBuffer += data;
      } else {
        xterm._attachSocketBuffer = data;
        setTimeout(xterm._flushBuffer, 10);
      }
    };

    xterm.on("data", function(key) {
      socket.emit("input", key);
    });
  }

  componentWillUnmount() {
    console.log("WUUPS");
  }
}
