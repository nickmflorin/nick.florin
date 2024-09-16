import { type Dispatch, type SetStateAction } from "react";

import { type FloatingContext } from "~/components/floating";

export interface DialogContext extends FloatingContext {
  readonly titleId: string | undefined;
  readonly contentId: string | undefined;
  readonly setTitleId: Dispatch<SetStateAction<string | undefined>>;
  readonly setContentId: Dispatch<SetStateAction<string | undefined>>;
}
