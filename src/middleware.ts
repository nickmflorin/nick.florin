import { NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { CMS_USER_ORG_SLUG, CMS_USER_ORG_ROLE, USER_ADMIN_ROLE } from "~/application/auth";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware((auth, req) => {
  const { has, redirectToSignIn, userId, orgSlug } = auth();
  if (isProtectedRoute(req)) {
    const hasAdminCmsAccess =
      (has({ role: USER_ADMIN_ROLE }) || has({ role: CMS_USER_ORG_ROLE })) &&
      orgSlug === CMS_USER_ORG_SLUG;
    if (userId && !hasAdminCmsAccess) {
      /* If there is a signed in user, but the user does not have explicit access to the CMS,
         redirect them to a 404 page.

         Note: Redirecting back to the dashboard can cause issues with the 'useNavigatable' hook
         and loading indicators on the navigation button, because if the navigation button is
         clicked while on the dashboard, and we redirect to the dashboard, this redirect will
         happen server side, and the page change will not be detected by the hook and the
         navigation button will show a loading indicator indefinitely. */
      return NextResponse.redirect(new URL("/404", req.url));
    } else if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    return NextResponse.next();
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
