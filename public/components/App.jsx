import React from "react";
import { connect } from "react-redux";
import Login from "./Login.jsx";
import Bob from "./Bob.jsx";
import Cindy from "./Cindy.jsx";
import Term from "./Term.jsx";
import socket from "./socket.jsx";
import store from "./store.jsx";

const mapStateToProps = (state, ownProps) => {
  console.log("")
  console.log("HEAR ME ROAR", state);
  if(state === undefined) {
    state = {
      user: ""
    };
  }
  console.log(state.user !== "");
  return {
    loggedIn: state.user !== ""
  }
}

const isActive = function(state) {
  return state.selected;
}

const getActive = function(state) {
  if(state instanceof Array) {
    var cs = state.map(getActive).filter(isActive);
    if(cs.length) {
      return cs[0];
    } else {
      return false;
    }
  } else {
    console.log(state);
   if(state.file) {
      return state;
   } else {
      return getActive(state.children);
   }
  }
}

class App extends React.Component {
  render() {
    if(this.props.loggedIn) {
      return (
          <div className="allo">
            <div className="sidebar">
              <div className="top">
                <span className="title">
                  <i className="fa fa-bolt"></i> MCL
                </span>
              </div>
              <div id="remainder" className="remainder">
                <Bob/>
              </div>
            </div>
            <div className="main">
              <div className="nav">
                <ul className="horizontal">
                  <li onClick={this.save.bind(this)}>Save <i className="fa fa-floppy-o"></i></li>
                </ul>
                <ul className="horizontal">
                  <li onClick={this.run.bind(this)}>Run <i className="fa fa-external-link-square"></i></li>
                </ul>
                <span className="pull-right">
                  <ul className="horizontal">
                    <li><a onClick={this.logout.bind(this)}>Logout</a></li>
                  </ul>
                </span>
              </div>
              <div className="all">
                <div className="fifty">
                    <Cindy/>
                </div>
                <div className="fifty">
                    <Term/>
                </div>
              </div>
            </div>
          </div>
      );
    } else {
      return (
        <Login/>
      );
    }
  }

  save() {
    var activeFile = getActive(store.getState().files);
    socket.emit("attemptSave", activeFile);
  }

  run() {
    var activeFile = getActive(store.getState().files);
    socket.emit("run", activeFile.path.join("/"));
  }

  logout() {
    socket.emit("logout");
  }
}

export default connect(mapStateToProps)(App);
