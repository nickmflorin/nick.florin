import { NextResponse } from "next/server";

import { authMiddleware } from "@clerk/nextjs";

import { createLeadingPathRegex } from "./lib/paths";

const DO_NOT_REDIRECT = "DO_NOT_REDIRECT" as const;
type DO_NOT_REDIRECT = "DO_NOT_REDIRECT";

type DynamicRedirect = {
  readonly pathRegex: RegExp;
  readonly redirectUrl: (result: ReturnType<RegExp["exec"]>) => string | DO_NOT_REDIRECT;
};

const DynamicRedirects: DynamicRedirect[] = [
  {
    pathRegex: createLeadingPathRegex("/resume"),
    redirectUrl: (result: ReturnType<RegExp["exec"]>) => {
      if (result && result[1]) {
        return "/resume/experience";
      }
      return DO_NOT_REDIRECT;
    },
  },
];

export default authMiddleware({
  /* beforeAuth: req => {
       const pathname = req.nextUrl.pathname;
       for (const { pathRegex, redirectUrl } of DynamicRedirects) {
         const execResult = pathRegex.exec(pathname);
         const redirect = redirectUrl(execResult);
         if (redirect !== DO_NOT_REDIRECT) {
           return NextResponse.redirect(new URL(redirect, req.nextUrl));
         }
       }
       return NextResponse.next();
     }, */
  publicRoutes: [
    "/",
    "/resume",
    "/resume/experience",
    "/resume/education",
    "/api/skills",
    "/projects",
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
