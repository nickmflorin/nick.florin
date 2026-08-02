import { type Dispatch, type SetStateAction } from 'react';

import { type FloatingContext } from '~/components/floating';

export interface DialogContext extends FloatingContext {
  readonly contentId: string | undefined;
  readonly setContentId: Dispatch<SetStateAction<string | undefined>>;
  readonly setTitleId: Dispatch<SetStateAction<string | undefined>>;
  readonly titleId: string | undefined;
}
