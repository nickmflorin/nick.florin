import { type MouseEvent, useCallback, useMemo, useState } from 'react';

import {
  autoUpdate as autoUpdater,
  type Middleware,
  type Placement,
  useFloating as rootUseFloating,
  useClick,
  useDismiss,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';

import * as types from '~/components/floating/types';

/**
 * Determines the options passed to the "dismiss" interaction of the floating element.
 *
 * If "dismiss" is explicitly included as a trigger, the options defined for that trigger are used.
 * Otherwise, if "click" is a trigger, the default options for the "dismiss" trigger are used,
 * enabled only when "click" is present.
 */
const getDismissOptions = (triggers: types.FloatingTrigger[]) =>
  types.hasFloatingTrigger(triggers, 'dismiss')
    ? { ...types.parseFloatingTriggerOptions(triggers, 'dismiss'), enabled: true }
    : { enabled: types.hasFloatingTrigger(triggers, 'click') };

export interface UseFloatingConfig {
  /**
   * Whether the floating element's position auto-updates when the reference or floating element
   * resizes, scrolls, or otherwise moves.
   *
   * This should not be blindly turned on, as it can cause performance degradation.
   *
   * @default false
   */
  readonly autoUpdate?: boolean;
  readonly debug?: boolean;
  readonly initiallyIsOpen?: boolean;
  readonly isOpen?: boolean;
  readonly middleware?: (false | Middleware | null | undefined)[];
  readonly onClose?: (
    e: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>,
  ) => void;
  readonly onOpen?: (e: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => void;
  readonly onOpenChange?: (
    value: boolean,
    evt: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>,
  ) => void;
  readonly placement?: Placement;
  readonly triggers?: types.FloatingTrigger[];
}

export const useFloating = ({
  autoUpdate = false,
  initiallyIsOpen = false,
  isOpen: propIsOpen,
  middleware,
  onClose,
  onOpen,
  onOpenChange,
  placement,
  triggers = ['hover'],
}: UseFloatingConfig): types.FloatingContext => {
  const [internalIsOpen, setInternalIsOpen] = useState(initiallyIsOpen);

  const isOpen = propIsOpen ?? internalIsOpen;

  const setIsOpen = useCallback(
    (v: boolean, evt: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => {
      setInternalIsOpen(v);
      onOpenChange?.(v, evt);
      if (v === true) {
        onOpen?.(evt);
      } else {
        onClose?.(evt);
      }
    },
    [onOpen, onClose, onOpenChange],
  );

  const { context, floatingStyles, refs } = rootUseFloating({
    middleware,
    onOpenChange: (value: boolean, evt: Event) => {
      if ((evt as KeyboardEvent).key !== 'Enter') {
        setIsOpen(value, evt);
      }
    },
    open: isOpen,
    placement,
    whileElementsMounted: autoUpdate ? autoUpdater : undefined,
  });

  const dismiss = useDismiss(context, getDismissOptions(triggers));
  const role = useRole(context, types.parseFloatingTriggerOptions(triggers, 'role'));
  const hover = useHover(context, types.parseFloatingTriggerOptions(triggers, 'hover'));

  /* If the floating element's open state is being controlled externally, we do not want it to
     automatically change when the reference element is clicked. */
  const click = useClick(context, types.parseFloatingTriggerOptions(triggers, 'click'));

  const { getFloatingProps, getReferenceProps } = useInteractions([hover, click, dismiss, role]);

  const referenceProps = useMemo(() => getReferenceProps(), [getReferenceProps]);
  const floatingProps = useMemo(() => getFloatingProps(), [getFloatingProps]);

  return useMemo(
    () => ({
      context,
      floatingProps,
      floatingStyles,
      isOpen,
      referenceProps,
      refs,
      setIsOpen,
    }),
    [isOpen, floatingProps, floatingStyles, context, refs, referenceProps, setIsOpen],
  );
};
