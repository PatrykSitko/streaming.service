import SocketIO from "socket.io-client";
import setMoviesCategories from "../../../../actions/set/movies/categories";
import addMoviesCategories from "../../../../actions/add/movies/categories";

export default ({ getState: getStore, dispatch }) => {
  const { state } = getStore();
  const client = SocketIO().connect();
  client.on("categories", serverData => {
    if (
      serverData &&
      serverData.constructor &&
      serverData.constructor.name === "Array"
    ) {
      dispatch(setMoviesCategories(state.movies, serverData));
      dispatch(addMoviesCategories(state.movies, serverData));
    }
    client.emit("store", getStore());
  });
};
