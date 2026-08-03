import { SignIn } from '@clerk/nextjs';

/**
 * The URL a user is redirected to after signing in, when no redirect search param is present.
 *
 * Clerk replaced `afterSignInUrl` with `fallbackRedirectUrl`, which applies only in that case.
 * This preserves the middleware's behavior of sending a user back to the page they originally
 * requested via `redirectToSignIn({ returnBackUrl })`.
 */
const SignInFallbackRedirectUrl = '/admin/skills';

const Page = () => <SignIn fallbackRedirectUrl={SignInFallbackRedirectUrl} />;

export default Page;
