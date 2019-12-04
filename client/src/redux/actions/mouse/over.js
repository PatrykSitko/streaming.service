import { MOUSE_OVER } from "../types";

export default (currentMouseState, over) => {
  return {
    type: MOUSE_OVER,
    payload: { mouse: { ...currentMouseState, over: over } }
  };
};
