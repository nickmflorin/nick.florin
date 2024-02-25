import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/resume(.*)",
    "/projects(.*)",
    "/api/skills(.*)",
    "/api/educations(.*)",
    "/api/experiences(.*)",
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
