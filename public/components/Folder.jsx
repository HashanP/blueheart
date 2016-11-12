import React from "react";
import File from "./File.jsx";
import Modal from "./Modal.jsx";
import socket from "./socket.jsx";

export default class Folder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      novaFileModal: false,
      novaFileField: "",
      novaFolderModal: false,
      novaFolderModal: "",
      dropped: false
    };
  }

  render() {
    var files = !this.props.file.children ? null : this.props.file.children.map((file) => {
      if(file.file) {
        return (
          <File file={file} key={file.name} dispatch={this.props.dispatch}/>
        );
      } else {
        return (
          <Folder file={file} key={file.name} dispatch={this.props.dispatch}/>
        );
      }
    });
    var bobs;
    if(files && this.state.expanded) {
      bobs =(
        <ul className="file-list">
          {files}
        </ul>
      );
    }
    var t3 = this.state.expanded ? "fa fa-caret-down" : "fa fa-caret-right";
    var t4 = this.state.dropped ? "drop visible" : "drop";
    return (
      <li>
      <div className="blob">
        <span className="sploge" onClick={() => this.setState({expanded: !this.state.expanded})}>
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
        <button className="btn btn-block" onClick={this.createFile.bind(this)}>Create File</button>
      </Modal>
      <Modal show={this.state.novaFolderModal} close={() => this.setState({novaFolderModal: false})}>
        Enter name<br/><br/>
        <div className="form-group">
          <input className="form-control" placeholder="Name" onChange={(e) => this.setState({novaFolderField:e.target.value})}/>
        </div>
        <button className="btn btn-block" onClick={this.createFolder.bind(this)}>Create Folder</button>
      </Modal>
    </li>
    );
  }

  createFile() {
    socket.emit("attemptCreateFile", this.props.file.path, this.state.novaFileField);
    this.setState({novaFileModal: false, novaFileField: ""});
  }

  createFolder() {
    socket.emit("attemptCreateFolder", this.props.file.path, this.state.novaFolderField);
    this.setState({novaFolderModal: false, novaFolderField: ""});
  }

  drop(e) {
    e.stopPropagation();
    this.setState({dropped: !this.state.dropped});
  }

  novaFile(e) {
    e.stopPropagation();
    this.setState({novaFileModal:true, dropped: false});
  }

  novaFolder(e) {
    e.stopPropagation();
    this.setState({novaFolderModal:true, dropped: false});
  }
}
