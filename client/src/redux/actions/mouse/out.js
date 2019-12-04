import { MOUSE_OUT } from "../types";

export default (currentMouseState, left) => {
  return {
    type: MOUSE_OUT,
    payload: { mouse: { ...currentMouseState, out: left } }
  };
};
