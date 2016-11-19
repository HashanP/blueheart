import React from "react";
import { Provider } from "react-redux";
import App from "./App.jsx";
import store from "./store.jsx";

export default class Container extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App/>
      </Provider>
    );
  }
}
