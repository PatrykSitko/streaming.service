import { startListener } from "redux-first-routing";
import { browserHistory } from "../../configuration";

export default store => {
  startListener(browserHistory, store);
};
