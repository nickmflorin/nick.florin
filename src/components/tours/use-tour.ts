import { useCallback, useState } from 'react';

import { useTour as useRootTour } from '@reactour/tour';
import { useCookies } from 'next-client-cookies';

import { logger } from '~/internal/logger';

import { SiteResumeActionsElementId } from '~/components/constants';
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
  const { setIsOpen: setRootTourIsOpen } = useRootTour();
  const { isLessThanOrEqualTo } = useScreenSizes();
  const [error, setError] = useState<null | string>(null);

  /* Whether the tour should be offered is decided once, as the initial state, rather than from an
     effect that opens the modal after the first render.  Both of the things it depends on - the
     screen size and the cookie - are readable while rendering, so there is nothing to synchronize
     with afterwards, and deciding up front avoids showing the dialog a render late. */
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(
    () =>
      !isLessThanOrEqualTo('md') && cookies.get(SuppressTourCookie)?.toLocaleLowerCase() !== 'true',
  );

  const setTourIsOpen = useCallback(
    (tourOpen: boolean) => {
      if (!tourOpen) {
        setRootTourIsOpen(false);
        return;
      }
      /* The tour's first step steps onto the header's resume actions, which only render when a
         primary resume exists.  Starting the tour without them would open it onto an element that
         is not in the document, so the absence is reported instead. */
      if (document.getElementById(SiteResumeActionsElementId) === null) {
        logger.error(
          `Could not find the '#${SiteResumeActionsElementId}' element in the DOM - there may ` +
            'not be any resumes populated.',
        );
        setError(
          'There was an error initializing the tour.  Do not worry - we are working on a fix!',
        );
        setRootTourIsOpen(false);
        return;
      }
      setRootTourIsOpen(true);
      setModalIsOpen(false);
    },
    [setRootTourIsOpen],
  );

  return { error, modalIsOpen, setModalIsOpen, setTourIsOpen };
};
