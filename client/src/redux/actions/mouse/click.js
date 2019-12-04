import { MOUSE_CLICK } from "../types";

export default (currentMouseState, clicked) => {
  return {
    type: MOUSE_CLICK,
    payload: { mouse: { ...currentMouseState, click: clicked } }
  };
};
