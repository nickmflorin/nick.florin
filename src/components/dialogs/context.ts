import { createContext } from 'react';

import type * as types from './types';

export const DialogContext = createContext<null | types.DialogContext>(null);
