import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface TableViewProps extends ComponentProps {
  readonly searchBar?: JSX.Element;
  readonly paginator?: JSX.Element;
  readonly children: JSX.Element;
}

export const TableView = ({ searchBar, paginator, children, ...props }: TableViewProps) => {
  const h =
    searchBar && paginator
      ? "calc(100% - 64px - 32px)"
      : searchBar || paginator
        ? "calc(100% - 32px - 16px)"
        : "100%";

  return (
    <div
      {...props}
      className={clsx("flex flex-col gap-[16px] h-full relative overflow-hidden", props.className)}
    >
      {searchBar}
      <div className="flex flex-grow flex-col" style={{ height: h, maxHeight: h }}>
        {children}
      </div>
      {paginator}
    </div>
  );
};

export default TableView;
