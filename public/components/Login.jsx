import React from "react";
import socket from "./socket.jsx";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: "", password: ""};
  }
  render() {
    return (
      <div className="login_box">
         <form onSubmit={this.login.bind(this)}>
           <h3>Algorithms Society</h3>
           <div className="form-group">
             <input className="form-control" value={this.state.username} onChange={this.updateUsername.bind(this)} type="text" placeholder="Username"/>
           </div>
           <div className="form-group">
             <input className="form-control" value={this.state.password} onChange={this.updatePassword.bind(this)} type="password" placeholder="Password"/>
           </div>
           <button className="btn btn-primary btn-block">Login</button>
         </form>
      </div>
    );
  }

  updateUsername(e) {
    this.setState({username: e.target.value});
  }

  updatePassword(e) {
    this.setState({password: e.target.value});
  }

  login(e) {
    e.preventDefault();
    socket.emit("authenticate", this.state.username, this.state.password);
  }
}
