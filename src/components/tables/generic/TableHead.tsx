import { classNames, type ComponentProps } from "~/components/types";

export interface TableHeadProps extends ComponentProps {
  readonly children?: React.ReactNode;
}

export const TableHead = (props: TableHeadProps) => (
  <thead {...props} className={classNames("table__head", props.className)} />
);

export default TableHead;
