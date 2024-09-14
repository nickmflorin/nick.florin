import { type ComponentProps, classNames } from "~/components/types";
import { Title, Description } from "~/components/typography";

export interface DrawerHeaderProps extends ComponentProps {
  readonly children?: string | JSX.Element;
  readonly description?: string | JSX.Element;
}

const _DrawerHeader = ({ children, description, ...props }: DrawerHeaderProps) =>
  children ? (
    <div {...props} className={classNames("drawer__header", props.className)}>
      {typeof children === "string" ? <Title component="h4">{children}</Title> : children}
      {typeof description === "string" ? (
        <Description fontSize="sm">{description}</Description>
      ) : (
        description
      )}
    </div>
  ) : (
    <></>
  );

export const DrawerHeader = Object.assign(_DrawerHeader, { displayName: "DrawerHeader" });
