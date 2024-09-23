"use client";
import { type ReactNode } from "react";

import { SWRConfig as RootSWRConfig } from "swr";

import { isHttpError } from "~/api";
import { isApiClientError } from "~/api-v2";
import { isHttpError as isHttpErrorV2 } from "~/integrations/http-v2";

type SWRConfigProps = { readonly children: ReactNode };

/**
 * Establishes global configuration for Vercel's {@link useSWR} hook in the context of this
 * application that is consistent with the requirements of Vercel's {@link useSWR} hook.
 *
 * See https://swr.vercel.app/
 */
export const SWRConfig = ({ children }: SWRConfigProps) => (
  <RootSWRConfig
    value={{
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      keepPreviousData: true,
      errorRetryCount: 0,
      onError: (e: unknown) => {
        /* It is necessary that any non-HttpError(s) are caught and thrown such that the behavior
           of the useSWR hook related to strongly typed errors is preserved. */
        if (!(e instanceof Error)) {
          throw new Error(`Client unexpectedly returned non-Error object ${e}`);
        } else if (!isHttpError(e) && !isHttpErrorV2(e) && !isApiClientError(e)) {
          throw e;
        }
      },
    }}
  >
    {children}
  </RootSWRConfig>
);
