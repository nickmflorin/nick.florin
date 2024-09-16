import { isFragment } from "react-is";

import { type ComponentProps, classNames } from "~/components/types";

export interface MenuFooterProps extends ComponentProps {
  readonly children: JSX.Element | undefined;
}

export const MenuFooter = ({ children, ...props }: MenuFooterProps): JSX.Element =>
  children && !isFragment(children) ? (
    <div {...props} className={classNames("menu__footer", props.className)}>
      {children}
    </div>
  ) : (
    <></>
  );
