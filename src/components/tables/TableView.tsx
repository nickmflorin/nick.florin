import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface TableViewProps extends ComponentProps {
  readonly searchBar?: JSX.Element;
  readonly controlBar?: JSX.Element;
  readonly paginator?: JSX.Element;
  readonly children: JSX.Element;
}

type TableViewControl = "paginator" | "searchBar" | "controlBar";

const GAP = 16;

const TableViewControlHeights: { [key in TableViewControl]: number } = {
  paginator: 32,
  controlBar: 32,
  searchBar: 32,
};

const getTotalHeight = (controls: { [key in TableViewControl]: JSX.Element | undefined }) => {
  let h: number = 0;
  for (const k in controls) {
    const control = controls[k as TableViewControl];
    if (control !== undefined) {
      h += TableViewControlHeights[k as TableViewControl] + GAP;
    }
  }
  return h === 0 ? "100%" : `calc(100% - ${h}px`;
};

interface ControlContainerProps extends ComponentProps {
  readonly children: JSX.Element | undefined;
  readonly control: TableViewControl;
}

const ControlContainer = ({ children, control, ...props }: ControlContainerProps) =>
  children ? (
    <div
      className={clsx(
        "flex flex-row items-center relative [&>*]:h-fill [&>*]:max-h-fill",
        props.className,
      )}
      style={{
        ...props.style,
        height: `${TableViewControlHeights[control]}px`,
        maxHeight: `${TableViewControlHeights[control]}px`,
      }}
    >
      {children}
    </div>
  ) : (
    <></>
  );

export const TableView = ({
  searchBar,
  paginator,
  controlBar,
  children,
  ...props
}: TableViewProps) => {
  const h = getTotalHeight({ searchBar, controlBar, paginator });
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
