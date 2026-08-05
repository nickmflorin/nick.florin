import { useCallback, useEffect, useRef, useState } from 'react';

import { useTour as useRootTour } from '@reactour/tour';
import { useCookies } from 'next-client-cookies';

import { logger } from '~/internal/logger';

import { useScreenSizes } from '~/hooks/use-screen-sizes';

/**
 * The cookie that records that the user has dismissed the tour and does not want to be shown it
 * again.
 *
 * The name must contain only RFC 6265 token characters. The client writes cookies through
 * js-cookie, which URL-encodes disallowed name characters (the previous name's ':' was stored as
 * '%3A'), while the server looks the name up raw from the request — so a name with special
 * characters is found on the client but missed on the server, and the two disagree about whether
 * the tour is suppressed (a hydration mismatch in the tour gate).
 */
export const SuppressTourCookie = 'nick-florin-suppress-tour';

export const useTour = () => {
  const cookies = useCookies();
  const { setIsOpen: _setTourIsOpen } = useRootTour();
  const observer = useRef<MutationObserver | null>(null);
  const [waitingForTour, setWaitingForTour] = useState(false);
  const { isLessThanOrEqualTo } = useScreenSizes();
  const [error, setError] = useState<null | string>(null);

  /* Whether the tour should be offered is decided once, as the initial state, rather than from an
     effect that opens the modal after the first render.  Both of the things it depends on - the
     screen size and the cookie - are readable while rendering, so there is nothing to synchronize
     with afterwards, and deciding up front avoids showing the dialog a render late. */
  const [internalModalIsOpen, setInternalModalIsOpen] = useState<boolean>(
    () =>
      !isLessThanOrEqualTo('md') && cookies.get(SuppressTourCookie)?.toLocaleLowerCase() !== 'true',
  );

  const removeMutationObserver = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
  }, []);

  useEffect(() => () => removeMutationObserver(), [removeMutationObserver]);

  const setTourIsOpen = useCallback(
    (tourOpen: boolean) => {
      let timeoutId: NodeJS.Timeout | undefined;

      const exitOnError = (e: string) => {
        logger.error(e);
        setError(
          'There was an error initializing the tour.  Do not worry - we are working on a fix!',
        );
        _setTourIsOpen(false);
        removeMutationObserver();
        setWaitingForTour(false);
      };

      if (tourOpen) {
        const button = document.getElementById('site-dropdown-menu-button');
        if (!button) {
          return exitOnError(
            "Could not find button with ID 'site-dropdown-menu-button' in DOM.  Tour " +
              'cannot be started.',
          );
        }
        button.click();
        observer.current = new MutationObserver(() => {
          const divElement = document.getElementById('site-dropdown-menu-resume-item');
          if (divElement) {
            if (timeoutId) {
              /* If we found the element, clear the timeout responsible for issuing an error
                 indicating that we could not find the element. */
              clearTimeout(timeoutId);
            }
            removeMutationObserver();
            setTimeout(() => {
              _setTourIsOpen(true);
              setInternalModalIsOpen(false);
              setWaitingForTour(false);
            }, 1000);
          }
        });
        const node = document.getElementsByClassName('header__right').item(0);
        if (node) {
          setWaitingForTour(true);
          observer.current.observe(node, {
            childList: true,
            subtree: true,
          });
          timeoutId = setTimeout(() => {
            exitOnError(
              "Could not find '#site-dropdown-menu-resume-item' element in DOM - there " +
                'may not be any resumes populated.',
            );
          }, 2000);
        } else {
          return exitOnError(
            "Could not find 'header__right' element in DOM - the drawer cannot be observed and " +
              'the tour must be ended.',
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
        setInternalModalIsOpen(true);
      } else {
        setInternalModalIsOpen(false);
        removeMutationObserver();
      }
    },
    [removeMutationObserver],
  );

  return {
    error,
    modalIsOpen: internalModalIsOpen,
    setModalIsOpen,
    setTourIsOpen,
    waitingForTour,
  };
};
