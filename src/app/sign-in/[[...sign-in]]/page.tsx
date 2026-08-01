import { SignIn } from "@clerk/nextjs";

export default async function Page() {
  /* Clerk replaced 'afterSignInUrl' with 'fallbackRedirectUrl', which applies only when no
     redirect search param is present.  That preserves the middleware's behavior of sending a user
     back to the page they originally requested via 'redirectToSignIn({ returnBackUrl })'. */
  return <SignIn fallbackRedirectUrl="/admin/skills" />;
}
