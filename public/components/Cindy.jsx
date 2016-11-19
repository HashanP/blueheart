import React from "react";
import { connect } from "react-redux";
import Codemirror from "react-codemirror";
const Haskell = require("codemirror/mode/haskell/haskell");
import { updateFile } from "../actions/file.jsx";

const isActive = function(state) {
  console.log(state);
  return state.selected;
}

const predicate = function(f) {
  return f !== false;
}

const getActive = function(state) {
   if(state.file) {
      return state;
   } else {
      var k = state.children.map(getActive).filter(predicate).filter(isActive);
      console.log(state.children.map(getActive));
      console.log(state.children.map(getActive).filter(predicate));
      console.log(k);
      if(k.length) {
        return k[0];
      } else {
        return false;
      }
   }
}

const mapStateToProps = (state, ownProps) => {
  if(state === undefined) {
    state = data;
  }
  console.log(state);
  return state;
}

class Cindy extends React.Component {
  render() {
    var file = getActive(this.props.files);
    console.log("HERERERERER ", file);
    var data = "";
    if(file) {
      data = file.data;
    }
    var options = {
      lineNumbers: true,
      mode: "haskell",
      tabSpaces: 2,
      extraKeys: {
        "Tab": function(cm){
          cm.replaceSelection("  " , "end");
        }
      }
    };

    if(file) {
      return (
        <Codemirror options={options} value={data} onChange={this.update.bind(this)}/>
      );
    } else {
      return (
        <div className="empty">
          <div className="empty-mini">
            No File Selected
          </div>
        </div>
      );
    }
  }

  update(nova) {
    console.log(nova);
    this.props.dispatch(updateFile(getActive(this.props.files).path, nova));
  }
}

export default connect(mapStateToProps)(Cindy);
