import { useEffect, useRef, useState } from 'react';

import type * as types from '~/components/types';

export interface ControlledTypographyVisibilityConfig {
  readonly initialState?: types.TypographyVisibilityState;
}

export const useControlledTypographyVisibility = ({
  initialState = 'collapsed',
}: ControlledTypographyVisibilityConfig) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [isTruncated, setIsTruncated] = useState(true);
  const [state, setState] = useState<types.TypographyVisibilityState>(initialState);

  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return undefined;
    }
    /* The observer reports the element's initial size as soon as it begins observing, so the
       initial measurement does not have to be taken separately.  Observing the element rather than
       listening for window resizes also catches the content itself changing height, which is what
       actually determines whether the text is truncated. */
    const observer = new ResizeObserver(() => {
      const { offsetHeight, scrollHeight } = element;
      setIsTruncated(offsetHeight < scrollHeight);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return {
    isTruncated,
    ref,
    state,
    toggle: () => setState(curr => (curr === 'collapsed' ? 'expanded' : 'collapsed')),
  };
};
