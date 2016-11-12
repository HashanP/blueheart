import React from "react";
import socket from "./socket.jsx";
import { connect } from "react-redux";
import Modal from "./Modal.jsx";

class File extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropped: false,
      delModal: false,
      expanded: false
    };
  }
  render() {
    var t2 = "";
    var t3 = "";
    if(this.props.file.selected) {
      t2 = "selected";
    }
    if(this.props.file.edited) {
      t3 = "*";
    }
    return (
      <li className={t2}>
        <div className="blob" onClick={this.select.bind(this)}>
          <span className="sploge" onClick={this.select.bind(this)}>
        <span className="folder-caret"></span>
          <i className="fa fa-file-code-o"></i> <span className="file-name">{this.props.file.name}{t3}</span>
        </span>
        <div className="pull-right pad">
          <i className="fa fa-times" onClick={() => this.setState({delModal: true})}></i>
        </div>
      </div>
      <Modal show={this.state.delModal} close={() => this.setState({delModal: false})}>
        Are you sure you want to delete this file?<br/><br/>
        <button className="btn btn-block" onClick={this.removeFile.bind(this)}>Yes</button>
      </Modal>
      </li>
    );
  }

  select() {
    socket.emit("load", this.props.file.path);
  }

  removeFile(e) {
    e.stopPropagation();
    console.log("HERE");
    socket.emit("attemptRemove", this.props.file.path);
    this.setState({delModal: false});
  }
}

export default File;
