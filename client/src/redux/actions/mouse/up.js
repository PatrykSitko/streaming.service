import { MOUSE_UP } from "../types";

export default (currentMouseState, released) => {
  return {
    type: MOUSE_UP,
    payload: { mouse: { ...currentMouseState, up: released } }
  };
};
