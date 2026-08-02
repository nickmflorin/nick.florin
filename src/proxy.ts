import { type NextRequest, NextResponse } from 'next/server';

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

import { CMS_USER_ORG_ROLE, CMS_USER_ORG_SLUG, USER_ADMIN_ROLE } from '~/application/auth';

const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

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
  if (isProtectedRoute(req)) {
    const hasAdminCmsAccess =
      (has({ role: USER_ADMIN_ROLE }) || has({ role: CMS_USER_ORG_ROLE })) &&
      orgSlug === CMS_USER_ORG_SLUG;
    if (userId && !hasAdminCmsAccess) {
      return NextResponse.redirect(getUnauthorizedRedirectUrl(req));
    } else if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    return NextResponse.next();
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
