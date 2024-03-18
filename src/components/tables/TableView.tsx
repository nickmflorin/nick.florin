import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { ControlContainer, getLeftoverHeight, GAP } from "./ControlContainer";

export interface TableViewProps extends ComponentProps {
  readonly searchBar?: JSX.Element;
  readonly controlBar?: JSX.Element;
  readonly paginator?: JSX.Element;
  readonly children: JSX.Element;
}

export const TableView = ({
  searchBar,
  paginator,
  controlBar,
  children,
  ...props
}: TableViewProps) => {
  const h = getLeftoverHeight({ searchBar, controlBar, paginator });
  return (
    <div
      {...props}
      className={clsx("flex flex-col h-full relative overflow-hidden", props.className)}
      style={{ ...props.style, gap: `${GAP}px` }}
    >
      <ControlContainer control="searchBar">{searchBar}</ControlContainer>
      <ControlContainer control="controlBar">{controlBar}</ControlContainer>
      <div className="flex flex-grow flex-col" style={{ height: h, maxHeight: h }}>
        {children}
      </div>
      <ControlContainer control="paginator">{paginator}</ControlContainer>
    </div>
  );
};

export default TableView;
