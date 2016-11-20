"use strict";

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const dirTree = require("directory-tree");
const fs = require("fs");
const path = require("path");
const Docker = require("dockerode");
const request = require("request");

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
  });

  var secrets = require("./secret.json");

  socket.on("authenticate", (code) => {
    request.post("https://login.microsoftonline.com/common/oauth2/v2.0/token", {form: {
      "grant_type": "authorization_code",
      "client_id": secrets.applicationId,
      "code": code,
      "redirect_uri": secrets.redirectURI,
      "client_secret": secrets.clientSecret
    }}, function(err, http, body) {
      body = JSON.parse(body);
      console.log(body);
      if(body.access_token) {
        request.get("https://graph.microsoft.com/v1.0/me", {headers: {"Authorization": "Bearer " + body.access_token}}, function(err, http, body2) {
          console.log(err);
          body2 = JSON.parse(body2);
          console.log(body2);
          details.access_token = body.access_token;
          details.authenticated = true;
          details.user = body2.mail.split("@")[0];
          docker.createContainer({
            HostConfig: {
              Binds: [ROOT + details.user + ":/app:ro"]
            },
            Image: "haskell:standard",
            Cmd: ["ghci"],
            Tty: true,
            AttachStdin: true,
            OpenStdin: true,
            ReadonlyRootfs: true
          }, function(err, container) {
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

            console.log(details.cols + " " + details.rows);
            console.log(details.user);
            fs.exists(ROOT + details.users, function(err, exists) {
              if(exists) {
                var filteredTree = dirTree(ROOT + details.user);
                filteredTree.children = filteredTree.children.filter(predicate);
                console.log(transform(filteredTree));
                socket.emit("authSuccess", details.user, filteredTree, body2.displayName);
              } else {
                fs.mkdir(ROOT + details.user, function(err) {
                  var filteredTree = dirTree(ROOT + details.user);
                  filteredTree.children = filteredTree.children.filter(predicate);
                  console.log(transform(filteredTree));
                  socket.emit("authSuccess", details.user, filteredTree, body2.displayName);
                });
              }
            });

          });
        });
        };
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
    } else {
      socket.emit("logoutSuccess");
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
  });
});
