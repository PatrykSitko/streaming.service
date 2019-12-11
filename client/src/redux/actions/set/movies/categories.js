import { SET_MOVIES_CATEGORIES } from "../../types";

export default (currentMoviesState, categories) => {
  return {
    type: SET_MOVIES_CATEGORIES,
    payload: {
      movies: {
        ...currentMoviesState,
        categories:
          categories &&
          categories.constructor &&
          categories.constructor.name === "Array"
            ? categories.flat(Infinity)
            : currentMoviesState.categories
      }
    }
  };
};
