const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const pty = require("pty.js");

app.use(express.static("public"));

server.listen(8080);

io.on("connection", function (socket) {
  console.log("hi");
  const shell = pty.spawn("login", [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.PWD,
    env: process.env
  });

  shell.stdout.on("data", (data) => {
    socket.emit("output", data.toString());
  });

  socket.on("input", (data) => {
    shell.stdin.write(data);
  });

  socket.on("size", (size) => {
    console.log(size);
    shell.resize(size.cols, size.rows);
  });

  socket.on("disconnect", () => {
    try {
      process.kill(shell.pid);
    } catch(e) {

    }
  });
});
