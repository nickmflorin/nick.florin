import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

export interface TableViewFooterProps extends ComponentProps {
  readonly children?: JSX.Element;
}

export const TableViewFooter = ({ children, ...props }: TableViewFooterProps): JSX.Element =>
  children ? (
    <div {...props} className={classNames("table-view__footer", props.className)}>
      {children}
    </div>
  ) : (
    <></>
  );
