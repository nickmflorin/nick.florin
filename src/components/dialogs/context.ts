import { createContext } from "react";

import type * as types from "./types";

export const DialogContext = createContext<types.DialogContext | null>(null);
