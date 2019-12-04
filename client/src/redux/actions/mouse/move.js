import { MOUSE_MOVE } from "../types";

export default (currentMouseState, moved) => {
  return {
    type: MOUSE_MOVE,
    payload: { mouse: { ...currentMouseState, move: moved } }
  };
};
