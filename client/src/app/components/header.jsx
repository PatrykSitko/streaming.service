import React from "react";
import Categories from "./categories";
import SearchBar from "./bar/search";

function Header() {
  return (
    <header>
      {[
        <Categories.buttons.Toggle key="categories-buttons-toggle" />,
        <SearchBar key="search-bar" />
      ]}
    </header>
  );
}

export default Header;
