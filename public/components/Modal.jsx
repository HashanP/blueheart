import React from "react";

export default class Modal extends React.Component {
  render() {
    var t1 = this.props.show ? "modal visible" : "modal";

    return (
      <div className={t1}>
        <div className="overlay"></div>
        <div className="contents">
          <div className="above">
            <div className="pull-right">
              <div className="pointer">
                <i className="fa fa-times" onClick={this.props.close}></i>
              </div>
            </div>
          </div>
          <div className="inner">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
