import React, { useRef } from "react";
import "./search.scss";

function SearchBar() {
  const searchbar = useRef();
  return <input ref={searchbar} type="text" className="search-bar" />;
}

export default SearchBar;
