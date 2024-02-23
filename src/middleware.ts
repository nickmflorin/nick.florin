import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  debug: true,
  publicRoutes: ["/", "/resume(.*)", "/projects(.*)", "/api/skills(.*)"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
