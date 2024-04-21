import { memo } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export type TableControl = "paginator" | "searchBar" | "controlBar";

export const ControlHeights: { [key in TableControl]: number } = {
  paginator: 32,
  controlBar: 32,
  searchBar: 32,
};

export const GAP = 16;

export const getLeftoverHeight = (
  controls: Partial<{
    [key in TableControl]: JSX.Element | undefined;
  }>,
) => {
  let h: number = 0;
  for (const k in controls) {
    const control = controls[k as TableControl];
    if (control !== undefined) {
      h += ControlHeights[k as TableControl] + GAP;
    }
  }
  return h === 0 ? "100%" : `calc(100% - ${h}px`;
};

interface ControlContainerProps extends ComponentProps {
  readonly children: JSX.Element | undefined;
  readonly control: TableControl;
}

export const ControlContainer = memo(({ children, control, ...props }: ControlContainerProps) =>
  children ? (
    <div
      className={clsx(
        "flex flex-row items-center relative [&>*]:h-fill [&>*]:max-h-fill",
        props.className,
      )}
      style={{
        ...props.style,
        height: `${ControlHeights[control]}px`,
        maxHeight: `${ControlHeights[control]}px`,
      }}
    >
      {children}
    </div>
  ) : (
    <></>
  ),
);
