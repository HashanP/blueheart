import React from "react";
import { connect } from "react-redux";
import Login from "./Login.jsx";
import Bob from "./Bob.jsx";
import Cindy from "./Cindy.jsx";
import Term from "./Term.jsx";
import socket from "./socket.jsx";
import store from "./store.jsx";
import Folder from "./Folder.jsx";

const mapStateToProps = (state, ownProps) => {
  if(state === undefined) {
    state = {
      user: ""
    };
  }
  return {
    loggedIn: state.user !== "",
    files: state.files
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
   if(state.file) {
      return state;
   } else {
      return getActive(state.children);
   }
  }
}

class Button extends React.Component {
  render() {
    var t1 = "btn btn-small";
    if(this.props.active) {
      t1 += " active";
    }
    return (
      <button className={t1} onClick={this.props.onClick}>{this.props.children}</button>
    );
  }
}

class App extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        mode: 1
      };
  }

  render() {
    var k;
    if(this.state.mode === 1) {
      k = (
        <div className="all">
          <div className="fifty">
            <Cindy/>
          </div>
          <div className="fifty">
            <Term/>
          </div>
        </div>
      );
    } else if(this.state.mode === 0) {
      k = (
        <div className="all">
          <div className="hundred">
            <Cindy/>
          </div>
          <div className="zero">
            <Term/>
          </div>
        </div>
      );
    } else if(this.state.mode === 2) {
      k = (
        <div className="all">
          <div className="zero">
            <Cindy/>
          </div>
          <div className="hundred">
            <Term/>
          </div>
        </div>
      );
    }

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
                <ul className="file-list">
                  <Folder file={this.props.files} dispatch={this.props.dispatch}/>
                </ul>
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
                  <ul className="horizontal bb">
                    <li>
                      <div className="btn-group">
                        <Button onClick={() => this.setState({mode: 0})} active={this.state.mode === 0}>
                          <i className="fa fa-edit"></i>
                        </Button>
                        <Button onClick={() => this.setState({mode: 1})} active={this.state.mode === 1}>
                          <i className="fa fa-columns"></i>
                        </Button>
                        <Button onClick={() => this.setState({mode: 2})} active={this.state.mode === 2}>
                          <i className="fa fa-terminal"></i>
                        </Button>
                      </div>
                    </li>
                  </ul>
                  <ul className="horizontal pull-right">
                    <li><a onClick={this.logout.bind(this)}>Logout</a></li>
                  </ul>
                </span>
              </div>
              {k}
            </div>
          </div>
      );
    } else {
      return null;
    }
  }

  save() {
    var activeFile = getActive(store.getState().files);
    if(activeFile) {
      socket.emit("attemptSave", activeFile);
    }
  }

  run() {
    var activeFile = getActive(store.getState().files);
    socket.emit("run", activeFile.path);
  }

  logout() {
    socket.emit("logout");
  }

  shortcut(e) {
    console.log("here");
    if ((e.metaKey || e.ctrlKey) && e.keyCode == 83) {
      e.preventDefault();
      e.stopPropagation();
      console.log("here2");
      this.save();
      // do stuff
      return false;
    }
    return true;
  }

  componentDidMount() {
    document.querySelector("body").addEventListener("keydown", this.shortcut.bind(this));
  }

  componentWillUnmount() {
    document.querySelector("body").removeEventListener("keydown", this.shortcut.bind(this));
  }
}

export default connect(mapStateToProps)(App);
