import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface MenuHeaderProps extends ComponentProps {
  readonly children: JSX.Element | undefined;
}

export const MenuHeader = ({ children, ...props }: MenuHeaderProps): JSX.Element =>
  children ? (
    <div {...props} className={clsx("menu__footer", props.className)}>
      {children}
    </div>
  ) : (
    <></>
  );
