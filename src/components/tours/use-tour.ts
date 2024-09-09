import { useState, useLayoutEffect, useRef, useCallback, useEffect } from "react";

import { useTour as useRootTour } from "@reactour/tour";
import { useCookies } from "next-client-cookies";

import { logger } from "~/application/logger";

import { useScreenSizes } from "~/hooks/use-screen-sizes";

export const useTour = () => {
  const cookies = useCookies();
  const [modalIsOpen, _setModalIsOpen] = useState(false);
  const wasChecked = useRef<boolean>(false);
  const { setIsOpen: _setTourIsOpen } = useRootTour();
  const observer = useRef<MutationObserver | null>(null);
  const [waitingForTour, setWaitingForTour] = useState(false);
  const { isLessThanOrEqualTo } = useScreenSizes({ defaultSize: "xs" });

  const removeMutationObserver = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
  }, []);

  useEffect(() => () => removeMutationObserver(), [removeMutationObserver]);

  const setTourIsOpen = useCallback(
    (tourOpen: boolean) => {
      if (tourOpen) {
        const button = document.getElementById("site-dropdown-menu-button");
        if (!button) {
          logger.error(
            "Could not find button with ID 'site-dropdown-menu-button' in DOM.  Tour " +
              "cannot be started.",
          );
          return _setTourIsOpen(false);
        }

        button.click();
        observer.current = new MutationObserver(() => {
          const divElement = document.getElementById("site-dropdown-menu-resume-item");
          if (divElement) {
            observer.current?.disconnect();
            observer.current = null;
            _setTourIsOpen(true);
            _setModalIsOpen(false);
            setWaitingForTour(false);
          }
        });
        const node = document.getElementsByClassName("header__right")[0];
        if (node) {
          setWaitingForTour(true);
          observer.current.observe(node, {
            subtree: true,
            childList: true,
          });
        } else {
          logger.error(
            "Could not find 'header__right' element in DOM - the drawer cannot be observed and " +
              "the tour must be ended.",
          );
        }
      }
    },
    [_setTourIsOpen],
  );

  const setModalIsOpen = useCallback(
    (v: boolean) => {
      if (v) {
        _setModalIsOpen(true);
      } else {
        _setModalIsOpen(false);
        removeMutationObserver();
      }
    },
    [removeMutationObserver],
  );

  useLayoutEffect(() => {
    if (isLessThanOrEqualTo("md")) {
      return;
    } else if (!wasChecked.current) {
      wasChecked.current = true;
      const cookie = cookies.get("nick.florin:suppress-tour");
      if (cookie && cookie.toLocaleLowerCase() === "true") {
        return;
      }
      setModalIsOpen(true);
    }
    return () => {
      setModalIsOpen(false);
    };
  }, [cookies, setModalIsOpen, isLessThanOrEqualTo]);

  return { modalIsOpen, waitingForTour, setTourIsOpen, setModalIsOpen };
};
