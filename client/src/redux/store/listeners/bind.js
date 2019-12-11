import bindWindowListeners from "./listener/window";
import bindHistoryListener from "./listener/history";
import bindSocketIOConnections from "./listener/socketIO/connections";

export default store => {
  bindHistoryListener(store);
  bindWindowListeners(store);
  bindSocketIOConnections(store);
};
