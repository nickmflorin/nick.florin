import { type IconButtonProps, IconButton } from "./generic";

export interface SocialButtonProps extends Omit<IconButtonProps<{ as: "a" }>, "options"> {}

export const SocialButton = (props: SocialButtonProps): JSX.Element => (
  <IconButton.Bare
    {...props}
    options={{ as: "a" }}
    className="text-gray-500 hover:text-blue-600"
    iconSize="full"
  />
);
