import { useMemo, useState } from 'react';

import type * as types from '../types';

import { useFloating, type UseFloatingConfig } from '~/components/floating/hooks/use-floating';

export interface DialogConfig extends Omit<
  UseFloatingConfig,
  'autoUpdate' | 'middleware' | 'placement' | 'triggers'
> {}

export function useDialog(config: DialogConfig): types.DialogContext {
  // Used for aria-controls.
  const [titleId, setTitleId] = useState<string | undefined>();
  // Used for aria-controls.
  const [contentId, setContentId] = useState<string | undefined>();

  const floating = useFloating({
    ...config,
    debug: true,
    triggers: ['click', 'role', { options: { outsidePressEvent: 'mousedown' }, type: 'dismiss' }],
  });

  return useMemo(
    () => ({
      ...floating,
      contentId,
      setContentId,
      setTitleId,
      titleId,
    }),
    [titleId, contentId, floating],
  );
}
