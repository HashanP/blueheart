const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const pty = require("pty.js");
const passwd = require("passwd-linux");
const dirTree = require("directory-tree");
const fs = require("fs");
const path = require("path");

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}


app.use(express.static(__dirname + "/public"));

server.listen(8080);

const isInvalid = function(path) {
  return path.split("/").includes(".") || path.split("/").includes("..");
}

const transform = function(file) {
  console.log(file);
  file.path = file.path.split("/").slice(6);
  if(file.children instanceof Array) {
    file.file = false;
    file.expanded = false;
    file.children = file.children.map(transform);
  } else {
    file.file = true;
    file.selected = false;
  }
  return file;
};

io.on("connection", (socket) => {
  var details = {
    authenticated: false,
    user: "",
    shell: null,
    cols: 80,
    rows: 24
  };

  socket.on("input", (data) => {
    if(details.shell && details.authenticated) {
      details.shell.stdin.write(data);
    }
  });

  socket.on("load", (file) => {
    if(isInvalid(file.join("/"))) {
      return false;
    }
    fs.readFile("/Users/hashanp/projects/home/" + details.user + "/" + file.join("/"), function(err, buf) {
      console.log(err);
      if(!err) {
        socket.emit("file", file, buf.toString());
      }
    });
  });

  socket.on("attemptSave", (file) => {
    if(isInvalid(file.path.join("/"))) {
      return false;
    }
    fs.writeFile("/Users/hashanp/projects/home/" + details.user + "/" + file.path.join("/"), file.data, function(err) {
      if(!err) {
        socket.emit("save", file.path);
      }
    });
  });

  socket.on("run", (file) => {
    socket.emit("clear");
    if(details.shell) {
        details.shell.destroy();
    }
    if(details.authenticated) {
      console.log("'ghci '~/projects/home/" + details.user + "/" + file + "'");
      details.shell = pty.spawn("sudo", ["-H", "-u", details.user, "bash",  "-c", "ghci \"~/projects/home/" + details.user + "/" + file + "\""], {
        name: "xterm-color",
        cols: details.cols,
        rows: details.rows,
        cwd: process.env.PWD,
        env: process.env
      });
      details.shell.stdout.on("data", (data) => {
        socket.emit("output", data.toString());
      });
    }
  });

  socket.on("size", (size) => {
    details.cols = size.cols;
    details.rows = size.rows;
    if(details.shell) {
      details.shell.resize(details.cols, details.rows);
    }
  });

  socket.on("authenticate", (username, password) => {
    console.log(username + " " + password);
    passwd.checkPass(username, password, (err, resp) => {
      console.log(resp);
      if(resp === "passwordCorrect") {
        details.authenticated = true;
        details.user = username;
        details.shell = pty.spawn("sudo", ["-H", "-u", details.user, "bash", "-c", "ghci"], {
          name: "xterm-color",
          cols: details.cols,
          rows: details.rows,
          cwd: process.env.PWD,
          env: process.env
        });
        console.log(details.cols + " " + details.rows);
        details.shell.stdout.on("data", (data) => {
          console.log("LOCATION 1");
          console.log(data);
          socket.emit("output", data.toString());
        });
        console.log(details.user);
        var filteredTree = dirTree("/Users/hashanp/projects/home/" + details.user);
        console.log(filteredTree.children.map(transform));
        socket.emit("authSuccess", details.user, filteredTree.children);
      }
    });
  });

  socket.on("logout", () => {
    details.authenticated = false;
    details.user = "";
    if(details.shell) {
      details.shell.destroy();
      socket.emit("logoutSuccess");
    }
  });

  socket.on("attemptRemove", (path) => {
    console.log(path);
    if(isInvalid(path.join("/"))) {
      return false;
    }
    fs.unlink("/Users/hashanp/projects/home/" + details.user + "/" + path.join("/"), function(err) {
      console.log(err);
      if(!err) {
        socket.emit("removeSuccess", path);
      }
    });
  });

  socket.on("attemptCreateFile", (path,name) => {
    console.log(path);
    if(isInvalid(path.join("/"))) {
      return false;
    }
    var p = "/Users/hashanp/projects/home/" + details.user + "/" + path.join("/") + "/" + name;
    fs.exists(p, function(err, yes) {
      if(err) {
        return;
      } else if(!yes) {
        fs.writeFile(p, "", function(err) {
          console.log(err);
          if(!err) {
            socket.emit("createFileSuccess", path, name);
          }
        });
      }
    });
  });

  socket.on("attemptCreateFolder", (path,name) => {
    console.log(path);
    if(isInvalid(path.join("/"))) {
      return false;
    }
    var p = "/Users/hashanp/projects/home/" + details.user + "/" + path.join("/") + "/" + name;
    fs.exists(p, function(err, yes) {
      if(err) {
        return;
      } else if(!yes) {
        fs.mkdir(p, function(err) {
          console.log(err);
          if(!err) {
            socket.emit("createFolderSuccess", path, name);
          }
        });
      }
    });
  });

  socket.on("disconnect", () => {
    if(details.shell) {
      details.shell.destroy();
    }
  });
});
