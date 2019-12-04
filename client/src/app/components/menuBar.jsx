import React from "react";
import { push } from "redux-first-routing";
import { connect } from "react-redux";
import "./menuBar.scss";

const mapDispatchToProps = dispatch => {
  return { changePath: path => dispatch(push(path)) };
};

function MenuBar({ changePath }) {
  return <div className="menu-bar"></div>;
}

export default connect(
  null,
  mapDispatchToProps
)(MenuBar);
