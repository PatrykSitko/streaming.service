import { createBrowserHistory, routerMiddleware } from "redux-first-routing";
import { applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import reducers from "./reducers";

export const browserHistory = (() => createBrowserHistory())();

export default (() => {
  const middlewares = applyMiddleware(routerMiddleware(browserHistory), thunk);
  const enhancers = window.__REDUX_DEVTOOLS_EXTENSION__
    ? compose(
        middlewares
        //window.__REDUX_DEVTOOLS_EXTENSION__()
      )
    : middlewares;
  return [reducers, enhancers];
})();
