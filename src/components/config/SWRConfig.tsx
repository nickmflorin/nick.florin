'use client';
import { type ReactNode } from 'react';

import { SWRConfig as RootSWRConfig } from 'swr';

import { isApiError } from '~/api';

type SWRConfigProps = { readonly children: ReactNode };

/**
 * Re-throws any error returned by an SWR fetcher that is not an `ApiError`, so that the strongly
 * typed error behavior of {@link useSWR} is preserved for callers that only expect to handle
 * `ApiError`(s).
 *
 * @param {unknown} e The error that was thrown by the fetcher.
 *
 * @throws {Error} If the error is not an instance of `Error`.
 * @throws {Error} If the error is an instance of `Error` but is not an `ApiError`.
 */
const onSWRError = (e: unknown) => {
  if (!(e instanceof Error)) {
    throw new Error(`Client unexpectedly returned non-Error object ${String(e)}`);
  } else if (!isApiError(e)) {
    throw e;
  }
};

/**
 * Establishes global configuration for Vercel's {@link useSWR} hook in the context of this
 * application that is consistent with the requirements of Vercel's {@link useSWR} hook.
 *
 * See `https://swr.vercel.app/`.
 */
export const SWRConfig = ({ children }: SWRConfigProps) => (
  <RootSWRConfig
    value={{
      errorRetryCount: 0,
      keepPreviousData: true,
      onError: onSWRError,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
    }}
  >
    {children}
  </RootSWRConfig>
);
