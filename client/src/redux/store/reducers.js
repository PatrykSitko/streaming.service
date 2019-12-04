import actions from "../actions/types";
import { combineReducers } from "redux";
import initialStateJSON from "./initial.state.json";

export const initialState = initialStateJSON.state;

export const stateReducer = (
  state = initialState,
  { type: currentAction, payload }
) => {
  for (let action of actions) {
    if (action.match(currentAction)) {
      if (payload) {
        return { ...state, ...payload };
      } else return state;
    }
  }
  return state;
};

export const initialRouterState = initialStateJSON.router;

export const routerReducer = (
  router = initialRouterState,
  { type: action, payload }
) => (action === "ROUTER/LOCATION_CHANGE" ? { ...router, ...payload } : router);

export default combineReducers({ state: stateReducer, router: routerReducer });
