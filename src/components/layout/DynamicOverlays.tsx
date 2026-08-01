"use client";
import dynamic from "next/dynamic";

/* Next no longer allows 'ssr: false' with next/dynamic inside a Server Component.  These components
   are browser-only, so their dynamic imports are declared here, inside a Client Component boundary,
   and referenced from the (server) Layout. */

export const ToastContainer = dynamic(() => import("./ToastContainer"), { ssr: false });

export const ContextDrawerWrapper = dynamic(
  () => import("~/components/drawers/ContextDrawerWrapper").then(mod => mod.ContextDrawerWrapper),
  { ssr: false },
);

export const SiteNavMenuOverlay = dynamic(
  () => import("~/features/site/components/SiteNavMenuOverlay").then(mod => mod.SiteNavMenuOverlay),
  { ssr: false },
);

export const UserProfile = dynamic(
  () => import("~/features/site/components/UserProfile").then(mod => mod.UserProfile),
  { ssr: false },
);
