import { createContext } from "react";

import type * as types from "../floating/types";

export const DialogContext = createContext<types.DialogContext | null>(null);
