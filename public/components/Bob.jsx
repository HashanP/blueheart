import React from "react";
import File from "./File.jsx";
import { connect } from "react-redux";

const mapStateToProps = (state, ownProps) => {
  if(state === undefined) {
    state = data;
  }
  console.log(state);
  return state;
}

class Bob extends React.Component {
  render() {
    console.log(this.props);
    var files = this.props.files.map(function(file) {
      return (
        <File file={file} key={file.name}/>
      );
    });
    return (
      <ul className="file-list">
        {files}
      </ul>
    );
  }
}

export default connect(mapStateToProps)(Bob);
