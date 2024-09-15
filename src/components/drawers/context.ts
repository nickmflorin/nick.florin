import { createContext } from "react";

import { type DrawersManager } from "./types";

export const DrawersContext = createContext<DrawersManager>({
  drawer: null,
  drawerId: null,
  isInScope: false,
  open: () => {},
  close: () => {},
});
