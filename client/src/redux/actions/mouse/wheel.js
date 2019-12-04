import { MOUSE_WHEEL } from "../types";

export default (currentMouseState, wheel) => {
  return {
    type: MOUSE_WHEEL,
    payload: { mouse: { ...currentMouseState, wheel: wheel } }
  };
};
