import { SignInButton as RootSignInButton } from '@clerk/nextjs';

import { Button, type ButtonProps } from '~/components/buttons';

export interface SignInButtonProps extends Omit<
  ButtonProps<'div'>,
  'element' | 'scheme' | 'size' | 'variant'
> {}

export const SignInButton = (props: SignInButtonProps) => (
  <RootSignInButton>
    <Button.Solid {...props} element='div' scheme='primary' size='medium'>
      Sign In
    </Button.Solid>
  </RootSignInButton>
);
