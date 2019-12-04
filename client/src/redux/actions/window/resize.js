import { WINDOW_RESIZED } from "../types";

export default resized => {
  return {
    type: WINDOW_RESIZED,
    payload: { window: resized }
  };
};
