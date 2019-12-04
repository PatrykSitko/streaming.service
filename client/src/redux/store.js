import bindListeners from "./store/listeners/bind";
import configuration from "./store/configuration";
import { createStore } from "redux";

const [reducers, enhancers] = configuration;

const store = createStore(reducers, enhancers);

bindListeners(store);

export default store;