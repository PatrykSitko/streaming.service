import bindWindowListeners from "./listener/window";
import bindHistoryListener from "./listener/history";

export default store => {
  bindHistoryListener(store);
  bindWindowListeners(store);
};
