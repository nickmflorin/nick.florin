import { Button, type ButtonProps } from '~/components/buttons/generic/Button';

export interface SignInButtonProps extends Omit<
  ButtonProps<'link'>,
  'element' | 'href' | 'scheme' | 'size' | 'variant'
> {}

/**
 * A link to the sign-in page, styled as a solid button.
 *
 * This deliberately does not use Clerk's `<SignInButton />`: that component requires
 * `<ClerkProvider />` to be mounted, and this button renders in the site menu on public pages,
 * where the provider (and clerk-js) is intentionally absent for anonymous visitors.
 */
export const SignInButton = (props: SignInButtonProps) => (
  <Button.Solid {...props} element='link' href='/sign-in' scheme='primary' size='medium'>
    Sign In
  </Button.Solid>
);
