import { SignIn } from '@clerk/nextjs';

/**
 * The URL a user is redirected to after signing in, when no redirect search param is present.
 *
 * Clerk replaced `afterSignInUrl` with `fallbackRedirectUrl`, which applies only in that case.
 * This preserves the middleware's behavior of sending a user back to the page they originally
 * requested via `redirectToSignIn({ returnBackUrl })`.
 */
const SignInFallbackRedirectUrl = '/admin/skills';

/* The centering container is what the widget occupies at first paint: without it, the
   server-rendered widget sits in-flow at the top-left of the content area until Clerk's client
   code takes over, and the jump between the two positions reads as a flash. */
const Page = () => (
  <div className='flex h-full w-full grow items-center justify-center'>
    <SignIn fallbackRedirectUrl={SignInFallbackRedirectUrl} routing='hash' />
  </div>
);

export default Page;
