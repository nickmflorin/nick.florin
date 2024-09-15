import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface MenuFooterProps extends ComponentProps {
  readonly children: JSX.Element | undefined;
}

export const MenuFooter = ({ children, ...props }: MenuFooterProps): JSX.Element =>
  children ? (
    <div {...props} className={classNames("menu__footer", props.className)}>
      {children}
    </div>
  ) : (
    <></>
  );
