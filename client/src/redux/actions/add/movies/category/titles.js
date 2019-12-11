import { ADD_MOVIES_CATEGORY_TITLES } from "../../types";

export default (
  currentMoviesState,
  category = "",
  titles = {
    "movie title": {
      thumbnail: "movie-image-name.png",
      manifest: "manifest-name.mpd",
      description: "",
      rating: 100,
      duration: "02:10:03"
    }
  }
) => {
  const newTitles =
    titles && titles.constructor && titles.constructor.name === "Object"
      ? titles
      : {};
  return {
    type: ADD_MOVIES_CATEGORY_TITLES,
    payload: {
      movies: titles["movie title"]
        ? currentMoviesState
        : {
            ...currentMoviesState,
            [category]: currentMoviesState[category]
              ? {
                  ...currentMoviesState[category],
                  ...newTitles
                }
              : { ...newTitles }
          }
    }
  };
};
