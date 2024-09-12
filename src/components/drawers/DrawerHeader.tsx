import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography";

export interface DrawerHeaderProps extends ComponentProps {
  readonly children?: string | JSX.Element;
}

const _DrawerHeader = ({ children, ...props }: DrawerHeaderProps) =>
  children ? (
    <div {...props} className={classNames("drawer__header", props.className)}>
      {typeof children === "string" ? <Title component="h4">{children}</Title> : children}
    </div>
  ) : (
    <></>
  );

export const DrawerHeader = Object.assign(_DrawerHeader, { displayName: "DrawerHeader" });
