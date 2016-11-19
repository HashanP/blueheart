"use strict";

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const passwd = require("passwd-linux");
const dirTree = require("directory-tree");
const fs = require("fs");
const path = require("path");
const Docker = require("dockerode");

var docker = new Docker({socketPath: '/var/run/docker.sock'});

const ROOT = "/home/";

const predicate = function(file) {
  if(file.name.charAt(0) === ".") {
    return false;
  } else {
    return true;
  }
}

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
  file.path = file.path.split("/").slice(2);
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
    if(details.stream) {
      console.log("here");
      details.stream.write(data);
    }
  });

  socket.on("load", (file) => {
    if(isInvalid(file.join("/"))) {
      return false;
    }
    fs.readFile(ROOT + details.user + "/" + file.slice(1).join("/"), function(err, buf) {
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
    fs.writeFile(ROOT + details.user + "/" + file.path.slice(1).join("/"), file.data, function(err) {
      if(!err) {
        socket.emit("save", file.path);
      }
    });
  });

  socket.on("run", (file) => {
    if(isInvalid(file.join("/"))) {
      return false;
    }
    socket.emit("clear");
    if(details.shell) {
        details.shell.destroy();
    }
    if(details.container) {
      let container = details.container;
      if(details.stream) {
        details.stream.end();
        details.stream = null;
      }
      container.stop(function(err) {
        console.log(err);
        container.remove(function(err) {
          console.log(err);
        });
      });
    }
    if(details.authenticated) {
      console.log("'ghci '" + ROOT + details.user + "/" + file.slice(1).join("/") + "'");
/*      details.shell = pty.spawn("sudo", ["-H", "-u", details.user, "bash",  "-c", "ghci \"" + ROOT + details.user + "/" + file.slice(1).join("/") + "\""], {
        name: "xterm-color",
        cols: details.cols,
        rows: details.rows,
        cwd: process.env.PWD,
        env: process.env
      });*/
      docker.createContainer({HostConfig: {Binds: [ROOT + details.user + ":/app:ro"]}, Image: "haskell:standard", Cmd: ["ghci", "/app/" + file.slice(1).join("/")], Tty: true, AttachStdin: true, OpenStdin: true, ReadonlyRootfs: true}, function(err, container) {
        details.container = container;
        if(!err) {
          container.attach({stream: true, stdout: true, stderr: true, stdin: true}, function(err, stream) {
            if(!err) {
              stream.on("data", (data) => {
                socket.emit("output", data.toString());
              });
              container.start(function (err, data) {
                if(err) {
                  console.log(err); 
                }
                details.stream = stream;
              });
            }
          });
        }
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
            docker.createContainer({HostConfig: {Binds: [ROOT + details.user + ":/app:ro"]}, Image: "haskell:standard", Cmd: ["ghci"], Tty: true, AttachStdin: true, OpenStdin: true, ReadonlyRootfs: true}, function(err, container) {
        details.container = container;
        if(!err) {
          container.attach({stream: true, stdout: true, stderr: true, stdin: true}, function(err, stream) {
            if(!err) {
              stream.on("data", (data) => {
                socket.emit("output", data.toString());
              });
              container.resize({h: details.rows, w: details.cols}, function(err) {
                container.start(function (err, data) {
                  if(err) {
                    console.log(err); 
                  }
                  details.stream = stream;
                });
              });
            }
          });
        }
      });
 
        console.log(details.cols + " " + details.rows);
        console.log(details.user);
        var filteredTree = dirTree(ROOT + details.user);
        filteredTree.children = filteredTree.children.filter(predicate);
        console.log(transform(filteredTree));
        socket.emit("authSuccess", details.user, filteredTree);
      }
    });
  });

  socket.on("logout", () => {
    details.authenticated = false;
    details.user = "";
    if(details.container) {
      let container = details.container;
      if(details.stream) {
        details.stream.end();
        details.stream = null;
      }
      container.stop(function(err) {
        console.log(err);
        container.remove(function(err) {
          socket.emit("logoutSuccess");
          console.log(err);
        });
      });
    }
    if(details.shell) {
      details.shell.destroy();
    }
  });

  socket.on("attemptRemove", (path) => {
    console.log(path);
    if(isInvalid(path.join("/"))) {
      return false;
    }
    fs.unlink(ROOT + details.user + "/" + path.slice(1).join("/"), function(err) {
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
    var p = ROOT + details.user + "/" + path.slice(1).join("/") + "/" + name;
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
    var p = ROOT + details.user + "/" + path.slice(1).join("/") + "/" + name;
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
