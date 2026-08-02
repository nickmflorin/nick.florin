import { createContext } from 'react';

import { type DrawersManager } from './types';

/* eslint-disable-next-line @typescript-eslint/no-empty-function -- The default context value has
   to provide no-op implementations that are replaced by the provider. */
const noop = () => {};

export const DrawersContext = createContext<DrawersManager>({
  close: noop,
  drawer: null,
  drawerId: null,
  isInScope: false,
  open: noop,
});
