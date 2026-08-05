import { type NextRequest, NextResponse, userAgent } from 'next/server';

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

import { CMS_USER_ORG_ROLE, CMS_USER_ORG_SLUG, USER_ADMIN_ROLE } from '~/application/auth';
import {
  type DeviceClass,
  DeviceClassByUserAgentDeviceType,
  ViewportDeviceHeader,
} from '~/application/viewport';

const isProtectedRoute = createRouteMatcher(['/admin(.*)', '/documents(.*)']);

/**
 * Infers the coarse {@link DeviceClass} for a request from its User-Agent.
 *
 * The User-Agent only distinguishes broad device classes, so anything that is not explicitly a
 * phone or tablet (including an absent or unrecognized User-Agent) is treated as a desktop.
 */
const getDeviceClassFromRequest = (req: NextRequest): DeviceClass => {
  const { device } = userAgent(req);
  if (device.type === undefined) {
    return 'desktop';
  }
  const deviceClass = DeviceClassByUserAgentDeviceType[device.type.toLowerCase().trim()];
  if (deviceClass === undefined) {
    /* eslint-disable-next-line no-console -- The logger is not edge-safe in the middleware. */
    console.warn(
      `Detected an unrecognized device type '${device.type}' from the request User-Agent. ` +
        "Falling back to 'desktop'.",
    );
    return 'desktop';
  }
  return deviceClass;
};

/**
 * Returns the request headers the middleware forwards to rendering, with the inferred
 * {@link DeviceClass} stamped on so the layout can seed the initial viewport state.
 */
const getForwardedHeaders = (req: NextRequest): Headers => {
  const headers = new Headers(req.headers);
  headers.set(ViewportDeviceHeader, getDeviceClassFromRequest(req));
  return headers;
};

/**
 * Returns the URL that a signed-in user without CMS access is redirected to.
 *
 * The redirect targets the 404 page rather than the dashboard because a server-side redirect back
 * to the dashboard is not observed by the `useNavigationItem` hook, which leaves the navigation
 * button showing a loading indicator indefinitely.
 *
 * @param {NextRequest} req The request that the redirect URL is constructed relative to.
 *
 * @returns {URL} The URL that the user should be redirected to.
 */
const getUnauthorizedRedirectUrl = (req: NextRequest): URL => new URL('/404', req.url);

export default clerkMiddleware(async (auth, req) => {
  const { has, orgSlug, redirectToSignIn, userId } = await auth();
  const headers = getForwardedHeaders(req);
  if (isProtectedRoute(req)) {
    const hasAdminCmsAccess =
      (has({ role: USER_ADMIN_ROLE }) || has({ role: CMS_USER_ORG_ROLE })) &&
      orgSlug === CMS_USER_ORG_SLUG;
    if (userId && !hasAdminCmsAccess) {
      return NextResponse.redirect(getUnauthorizedRedirectUrl(req));
    } else if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
