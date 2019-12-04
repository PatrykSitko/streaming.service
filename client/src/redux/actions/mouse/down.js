import { MOUSE_DOWN} from "../types";

export default (currentMouseState, pressed) => {
  return {
    type: MOUSE_DOWN,
    payload: { mouse: { ...currentMouseState, down: pressed } }
  };
};
