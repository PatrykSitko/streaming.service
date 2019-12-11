import { ADD_MOVIES_CATEGORIES } from "../../types";

export default (currentMoviesState, categories) => {
  return {
    type: ADD_MOVIES_CATEGORIES,
    payload: {
      movies: {
        ...currentMoviesState,
        ...(() => {
          let newCategories = {};
          for (let category of [categories].flat(Infinity)) {
            newCategories[category] = currentMoviesState[category]
              ? currentMoviesState[category]
              : {};
          }
          return newCategories;
        })()
      }
    }
  };
};
