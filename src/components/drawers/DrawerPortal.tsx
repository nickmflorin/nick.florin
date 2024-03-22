"use client";
import {
  type ReactNode,
  useState,
  useEffect,
  useTransition,
  isValidElement,
  useCallback,
} from "react";

import { createPortal } from "react-dom";
import ReactHtmlParser, { processNodes, convertNodeToElement } from "react-html-parser";

import { logger } from "~/application/logger";

import { useDrawerParams } from "./hooks";

import { QueryDrawerIds, type DrawerId } from ".";

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
  readonly id: DrawerId;
  readonly children: ReactNode;
}

export const DrawerPortal = ({ id, children }: DrawerPortalProps): JSX.Element => {
  const [innerHtmlEmptied, setInnerHtmlEmptied] = useState(false);
  const [target, setTarget] = useState<Element | null>(null);
  const [element, setElement] = useState<JSX.Element | null>(null);
  const [_, startTransition] = useTransition();
  const { clearQuery } = useDrawerParams();
  // const target = getTarget();

  /* useEffect(() => {
       if (!innerHtmlEmptied && target) {
         target.innerHTML = "";
         setInnerHtmlEmptied(true);
       }
     }, [innerHtmlEmptied]); */

  const prepareTarget = useCallback((tg: Element) => {
    if (tg.innerHTML !== "") {
      const element = ReactHtmlParser(tg.innerHTML);
      if (element.length === 1 && isValidElement(element[0])) {
        const ps = element[0].props;
        if (typeof ps === "object" && ps !== null && "id" in ps && ps.id !== id) {
          console.log("RESETTING INNER");
          console.log({ propId: ps.id, id });
          tg.innerHTML = "";
        }
      }
    }
    return tg;
  }, []);

  useEffect(() => {
    const tg = getTarget();
    if (tg) {
      setTarget(prepareTarget(tg));
    }
  }, []);

  // /* This must be in an effect to force the portal to render client side, because the document must
  //    be defined. */
  useEffect(() => {
    if (target) {
      /* if (target.innerHTML !== "") {
           target.innerHTML = "";
         } */
      if (!QueryDrawerIds.contains(id)) {
        console.log(`CLEARING QUERY FOR: ${id} `);
        clearQuery();
      }
      return setElement(createPortal(children, target));
    }
    // console.log("NO TARGET");

    /* if (target && innerHtmlEmptied) {
         // return startTransition(() => {
         return setElement(createPortal(children, target));
         // });
       } */
    return setElement(<></>);
  }, [target, children, id]);

  return <>{element}</>;
  /* if (!innerHtmlEmptied) {
       console.log("NOT EMPTIED");
     }
     if (!innerHtmlEmptied || !target) {
       return <></>;
     } */

  // return createPortal(children, target);
};

export default DrawerPortal;
