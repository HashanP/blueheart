import React from "react";
import socket from "./socket.jsx";
import { connect } from "react-redux";
import Modal from "./Modal.jsx";

const mapStateToProps = (state, ownProps) => {
  if(state === undefined) {
    state = data;
  }
  console.log(state);
  return state;
}

class File extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropped: false,
      delModal: false
    };
  }
  render() {
    var t2 = "";
    var t3 = "";
    if(this.props.file.selected) {
      t2 = " selected";
    }
    if(this.props.file.edited) {
      t3 = "*";
    }
    console.log(this.props.file);
    if(this.props.file.file) {
      return (
        <li className={t2} onClick={this.select.bind(this)}>
          <div className="blob">
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
            <button className="button" onClick={this.removeFile.bind(this)}>Yes</button>
          </Modal>
        </li>
      );
    } else {
      var t4 = this.props.file.expanded ? "fa fa-caret-down" : "fa fa-caret-right";
      var files = !this.props.file.children ? null : this.props.file.children.map(function(file) {
        return (<File2 file={file} key={file.name}/>);
      });
      console.log(files);
      var bobs;
      if(files && this.props.file.expanded) {
        bobs =(
          <ul className="file-list">
            {files}
          </ul>
        );
      }
      var t3 = this.props.file.expanded ? "fa fa-caret-down" : "fa fa-caret-right";
      var t4 = this.state.dropped ? "drop visible" : "drop";
      return (
        <li>
          <div className="blob">
            <span className="sploge" onClick={this.select.bind(this)}>
              <span className="folder-caret"></span>
              <span className="file-caret"><i className={t3}></i></span>
              <span className="folder-caret"></span>
              <i className="fa fa-folder-o"></i> <span className="folder-name">{this.props.file.name}</span>
            </span>
            <div className="pull-right pad bit">
              <i className="fa fa-plus" onClick={this.drop.bind(this)}></i>
              <div className={t4}>
                <ul>
                  <li onClick={this.novaFile.bind(this)}>New File</li>
                  <li onClick={this.novaFolder.bind(this)}>New Folder</li>
                </ul>
              </div>
            </div>
          </div>
          {bobs}
          <Modal show={this.state.novaFileModal} close={() => this.setState({novaFileModal: false})}>
            Enter name<br/><br/>
            <div className="form-group">
              <input className="form-control" onChange={(e) => this.setState({novaFileField:e.target.value})} placeholder="Name"/>
            </div>
            <button className="button" onClick={this.createFile.bind(this)}>Create File</button>
          </Modal>
          <Modal show={this.state.novaFolderModal} close={() => this.setState({novaFolderModal: false})}>
            Enter name<br/><br/>
            <div className="form-group">
              <input className="form-control" placeholder="Name" onChange={(e) => this.setState({novaFolderField:e.target.value})}/>
            </div>
            <button className="button" onClick={this.createFolder.bind(this)}>Create Folder</button>
          </Modal>
        </li>
      );
    }
  }

  select() {
    console.log("HERE 1");
    if(this.props.file.file) {
      socket.emit("load", this.props.file.path);
    } else {
      console.log("HERE 2");
      this.props.dispatch({type: "SELECT_FOLDER", path: this.props.file.path});
    }
  }

  novaFile(e) {
    e.stopPropagation();
    this.setState({novaFileModal:true, dropped: false});
  }

  novaFolder(e) {
    e.stopPropagation();
    this.setState({novaFolderModal:true, dropped: false});
  }

  createFile() {
    socket.emit("attemptCreateFile", this.props.file.path, this.state.novaFileField);
    this.setState({novaFileModal: false, novaFileField: ""});
  }

  createFolder() {
    socket.emit("attemptCreateFolder", this.props.file.path, this.state.novaFolderField);
    this.setState({novaFolderModal: false, novaFolderField: ""});
  }

  removeFile(e) {
    e.stopPropagation();
    console.log("HERE");
    socket.emit("attemptRemove", this.props.file.path);
    this.setState({delModal: false});
  }

  drop(e) {
    e.stopPropagation();
    this.setState({dropped: !this.state.dropped});
  }
}

var File2 =  connect(mapStateToProps)(File);

export default File2;
