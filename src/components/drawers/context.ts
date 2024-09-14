import { createContext } from "react";

import { type DrawersManager } from "./types";

export const DrawersContext = createContext<DrawersManager>({
  drawer: null,
  isReady: false,
  open: () => {},
  close: () => {},
});
