import { use } from 'react';

import { DialogContext } from '../context';

export const useDialogContext = () => {
  const context = use(DialogContext);

  if (context === null) {
    throw new Error('Dialog components must be wrapped in <Dialog.Root />');
  }

  return context;
};
