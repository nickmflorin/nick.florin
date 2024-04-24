import { useState, useMemo, useCallback } from "react";

import {
  type Placement,
  useFloating as rootUseFloating,
  useInteractions,
  useHover,
  useClick,
  useDismiss,
  autoUpdate as autoUpdater,
  useRole,
  type Middleware,
} from "@floating-ui/react";

import * as types from "../types";

export interface UseFloatingConfig {
  readonly isOpen?: boolean;
  readonly debug?: boolean;
  readonly initiallyIsOpen?: boolean;
  readonly autoUpdate?: boolean;
  readonly triggers?: types.FloatingTrigger[];
  readonly placement?: Placement;
  readonly middleware?: Array<Middleware | null | undefined | false>;
  readonly onOpen?: (e: Event | React.MouseEvent<HTMLButtonElement>) => void;
  readonly onClose?: (e: Event | React.MouseEvent<HTMLButtonElement>) => void;
  readonly onOpenChange?: (
    value: boolean,
    evt: Event | React.MouseEvent<HTMLButtonElement>,
  ) => void;
}

export const useFloating = ({
  // Note: This should not be blindly turned on because it can cause performance degradation.
  autoUpdate = false,
  triggers = ["hover"],
  isOpen: propIsOpen,
  placement,
  middleware,
  initiallyIsOpen = false,
  onOpen,
  onClose,
  onOpenChange,
}: UseFloatingConfig): types.FloatingContext => {
  const [_isOpen, _setIsOpen] = useState(initiallyIsOpen);

  /* Allow the open state of the floating element to be controlled externally to the component if
     desired. */
  const isOpen = propIsOpen === undefined ? _isOpen : propIsOpen;

  const setIsOpen = useCallback(
    (v: boolean, evt: Event | React.MouseEvent<HTMLButtonElement>) => {
      _setIsOpen(v);
      onOpenChange?.(v, evt);
      if (v === true) {
        onOpen?.(evt);
      } else {
        onClose?.(evt);
      }
    },
    [onOpen, onClose, onOpenChange],
  );

  const { refs, floatingStyles, context } = rootUseFloating({
    open: isOpen,
    whileElementsMounted: autoUpdate ? autoUpdater : undefined,
    onOpenChange: (value: boolean, evt: Event) => setIsOpen(value, evt),
    placement,
    middleware,
  });

  const dismiss = useDismiss(
    context,
    /* If "dismiss" is explicitly included as a trigger, use the options defined for that trigger.
       Otherwise, if "click" is a trigger, use the default options for the "dismiss" trigger. */
    types.hasFloatingTrigger(triggers, "dismiss")
      ? { ...types.parseFloatingTriggerOptions(triggers, "dismiss"), enabled: true }
      : { enabled: types.hasFloatingTrigger(triggers, "click") },
  );
  const role = useRole(context, types.parseFloatingTriggerOptions(triggers, "role"));
  const hover = useHover(context, types.parseFloatingTriggerOptions(triggers, "hover"));

  /* If the floating element's open state is being controlled externally, we do not want it to
     automatically change when the reference element is clicked. */
  const click = useClick(context, types.parseFloatingTriggerOptions(triggers, "click"));

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss, role]);

  const referenceProps = useMemo(() => getReferenceProps(), [getReferenceProps]);
  const floatingProps = useMemo(() => getFloatingProps(), [getFloatingProps]);

  return useMemo(
    () => ({
      setIsOpen,
      referenceProps,
      floatingProps,
      context,
      refs,
      floatingStyles,
      isOpen,
    }),
    [isOpen, floatingProps, floatingStyles, context, refs, referenceProps, setIsOpen],
  );
};
