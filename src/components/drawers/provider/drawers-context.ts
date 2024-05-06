import { createContext } from "react";

import { type DrawersManager } from "./types";

export const DrawersContext = createContext<DrawersManager>({
  drawer: null,
  isReady: false,
  forwardEnabled: false,
  backEnabled: false,
  open: () => {},
  close: () => {},
  forward: () => {},
  back: () => {},
});
