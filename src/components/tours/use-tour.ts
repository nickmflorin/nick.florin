import { useState, useLayoutEffect, useRef, useCallback, useEffect } from "react";

import { useTour as useRootTour } from "@reactour/tour";
import { useCookies } from "next-client-cookies";

import { logger } from "~/internal/logger";

import { useScreenSizes } from "~/hooks/use-screen-sizes";

export const useTour = () => {
  const cookies = useCookies();
  const [modalIsOpen, _setModalIsOpen] = useState(false);
  const wasChecked = useRef<boolean>(false);
  const { setIsOpen: _setTourIsOpen } = useRootTour();
  const observer = useRef<MutationObserver | null>(null);
  const [waitingForTour, setWaitingForTour] = useState(false);
  const { isLessThanOrEqualTo } = useScreenSizes();
  const [error, setError] = useState<string | null>(null);

  const removeMutationObserver = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
  }, []);

  useEffect(() => () => removeMutationObserver(), [removeMutationObserver]);

  const setTourIsOpen = useCallback(
    (tourOpen: boolean) => {
      let timeoutId: NodeJS.Timeout;

      const exitOnError = (e: string) => {
        logger.error(e);
        setError(
          "There was an error initializing the tour.  Do not worry - we are working on a fix!",
        );
        _setTourIsOpen(false);
        removeMutationObserver();
        setWaitingForTour(false);
      };

      if (tourOpen) {
        const button = document.getElementById("site-dropdown-menu-button");
        if (!button) {
          return exitOnError(
            "Could not find button with ID 'site-dropdown-menu-button' in DOM.  Tour " +
              "cannot be started.",
          );
        }
        button.click();
        observer.current = new MutationObserver(() => {
          const divElement = document.getElementById("site-dropdown-menu-resume-item");
          if (divElement) {
            if (timeoutId) {
              /* If we found the element, clear the timeout responsible for issuing an error
                 indicating that we could not find the element. */
              clearTimeout(timeoutId);
            }
            removeMutationObserver();
            setTimeout(() => {
              _setTourIsOpen(true);
              _setModalIsOpen(false);
              setWaitingForTour(false);
            }, 1000);
          }
        });
        const node = document.getElementsByClassName("header__right")[0];
        if (node) {
          setWaitingForTour(true);
          observer.current.observe(node, {
            subtree: true,
            childList: true,
          });
          timeoutId = setTimeout(() => {
            exitOnError(
              "Could not find '#site-dropdown-menu-resume-item' element in DOM - there " +
                "may not be any resumes populated.",
            );
          }, 2000);
        } else {
          return exitOnError(
            "Could not find 'header__right' element in DOM - the drawer cannot be observed and " +
              "the tour must be ended.",
          );
        }
      } else {
        _setTourIsOpen(false);
      }
    },
    [_setTourIsOpen, removeMutationObserver],
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

  return { error, modalIsOpen, waitingForTour, setTourIsOpen, setModalIsOpen };
};
