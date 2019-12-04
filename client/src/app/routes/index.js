import React from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./home";
import "../app.scss";

document.title = "react app";

export const Routes = () => (
  <Switch>
    <Route path="/" exact strict component={Home} />
  </Switch>
);
