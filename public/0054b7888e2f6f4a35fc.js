/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	var xterm = new Terminal();
	xterm.open(document.getElementById("hello"));
	xterm.fit();

	var port = "";
	if (window.location.port) {
	  port = ":" + window.location.port;
	}
	var socket = io("//" + window.location.hostname + port);
	socket.on("output", function (data) {
	  //        xterm._pushToBuffer(data);
	  xterm.write(data);
	});

	xterm._flushBuffer = function () {
	  xterm.write(xterm._attachSocketBuffer);
	  xterm._attachSocketBuffer = null;
	  clearTimeout(xterm._attachSocketBufferTimer);
	  xterm._attachSocketBufferTimer = null;
	};

	xterm._pushToBuffer = function (data) {
	  if (xterm._attachSocketBuffer) {
	    xterm._attachSocketBuffer += data;
	  } else {
	    xterm._attachSocketBuffer = data;
	    setTimeout(xterm._flushBuffer, 10);
	  }
	};

	xterm.on("data", function (key) {
	  socket.emit("input", key);
	});

	socket.emit("authenticate", "kieran", "defaultpassword");

	var cols = xterm.cols;
	var rows = xterm.rows;
	xterm.resize(cols, rows + 1);
	xterm.resize(cols, rows);
	socket.emit("size", { cols: cols, rows: rows });

	xterm.on("resize", function (size) {
	  socket.emit("size", { cols: size.cols, rows: size.rows });
	});

	socket.on("tree", function (tree) {
	  ReactDOM.render(React.createElement(Bob, { files: tree }), document.getElementById("remainder"));
	  ReactDOM.render(React.createElement(Cindy, null), document.querySelector(".cindy"));
	  console.log(tree);
	});

	var File = React.createClass({
	  displayName: "File",

	  render: function () {
	    var t2 = "";
	    if (this.props.selected) {
	      t2 = " selected";
	    }
	    console.log(this.props.file);
	    if (!(this.props.file.children instanceof Array)) {
	      return React.createElement(
	        "li",
	        { className: t2 },
	        React.createElement("span", { className: "folder-caret" }),
	        React.createElement("i", { className: "fa fa-file-code-o" }),
	        " ",
	        React.createElement(
	          "span",
	          { className: "file-name" },
	          this.props.file.name
	        )
	      );
	    } else {
	      var files = !this.props.file.children ? null : this.props.file.children.map(function (file) {
	        return React.createElement(File, { file: file });
	      });
	      console.log(files);
	      var bobs;
	      if (files) {
	        bobs = React.createElement(
	          "ul",
	          { className: "file-list" },
	          files
	        );
	      }
	      return React.createElement(
	        "li",
	        null,
	        React.createElement(
	          "span",
	          { className: "file-caret" },
	          React.createElement("i", { className: "fa fa-caret-right" })
	        ),
	        React.createElement("i", { className: "fa fa-folder-o" }),
	        " ",
	        React.createElement(
	          "span",
	          { className: "folder-name" },
	          this.props.file.name
	        ),
	        bobs
	      );
	    }
	  }
	});

	var Bob = React.createClass({
	  displayName: "Bob",

	  render: function () {
	    var files = this.props.files.children.map(function (file) {
	      return React.createElement(File, { file: file });
	    });
	    return React.createElement(
	      "ul",
	      { className: "file-list" },
	      files
	    );
	  }
	});

	var Cindy = React.createClass({
	  displayName: "Cindy",

	  render: function () {
	    return React.createElement(Codemirror, { mode: "haskell" });
	  }
	});

	var files = [{
	  filename: "main.mcl",
	  folder: false
	}, {
	  filename: "data",
	  folder: true,
	  files: [{
	    filename: "main.mcl",
	    folder: false
	  }, {
	    filename: "tom.mcl",
	    folder: false
	  }, {
	    filename: "merry.mcl",
	    folder: false,
	    selected: true
	  }]
	}];

/***/ }
/******/ ]);