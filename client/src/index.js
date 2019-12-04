import React from "react";
import ReactDOM from "react-dom";
import { browserHistory } from "./redux/store/configuration";
import * as serviceWorker from "./serviceWorker";
import { Router } from "react-router-dom";
import { Provider } from "react-redux";
import { Routes } from "./app/routes";
import store from "./redux/store";
import MenuBar from "./app/components/menuBar";

ReactDOM.render(
  <Provider store={store}>
    <MenuBar />
    <Router history={browserHistory}>
      <Routes />
    </Router>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
