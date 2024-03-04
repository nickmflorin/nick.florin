"use client";
import { type ReactNode, useState, useEffect, useTransition } from "react";

import { createPortal } from "react-dom";

import { logger } from "~/application/logger";

const getTarget = (): Element | null => {
  const tg = document.querySelector("#drawer-target");
  if (tg) {
    return tg;
  }
  // This would only ever happen if the <div id="#drawer-target"> was removed from the DOM.
  logger.error(
    "The drawer target with ID '#drawer-target' could not be found in the DOM when rendering " +
      "a drawer!",
  );
  return null;
};

interface DrawerPortalProps {
  readonly children: ReactNode;
}

export const DrawerPortal = ({ children }: DrawerPortalProps): JSX.Element => {
  const [element, setElement] = useState<JSX.Element | null>(null);
  const [_, startTransition] = useTransition();

  /* This must be in an effect to force the portal to render client side, because the document must
     be defined. */
  useEffect(() => {
    const target = getTarget();
    if (target) {
      return startTransition(() => {
        setElement(createPortal(children, target));
      });
    }
    return setElement(<></>);
  }, [children]);

  return <>{element}</>;
};

export default DrawerPortal;
