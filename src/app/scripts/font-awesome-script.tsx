"use client";
import Script from "next/script";

export const FontAwesomeScript = ({ token }: { token: string }) => (
  <Script
    type="text/javascript"
    src={`https://kit.fontawesome.com/${token}.js`}
    crossOrigin="anonymous"
    /* Using "nest" instead of "replace" avoids errors related to
       NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is
       not a child of this node */
    data-auto-replace-svg="nest"
    strategy="afterInteractive"
  />
);
