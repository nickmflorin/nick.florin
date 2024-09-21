import type { ReactNode } from "react";

import {
  classNames,
  type QuantitativeSize,
  type ComponentProps,
  sizeToString,
} from "~/components/types";

const TileInner = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-row items-center justify-between">{children}</div>
);

export interface ResumeSimpleTileScaffoldProps extends ComponentProps {
  readonly icon: JSX.Element;
  readonly description?: JSX.Element | null;
  readonly descriptionGap?: QuantitativeSize<"px">;
  readonly children: ReactNode;
  readonly numDescriptionLines?: number;
}

export const ResumeSimpleTileScaffold = ({
  icon,
  description,
  descriptionGap = "2px",
  children,
  ...props
}: ResumeSimpleTileScaffoldProps) => (
  <div
    {...props}
    className={classNames(
      "flex flex-row gap-[12px] max-w-full w-full overflow-hidden",
      { "items-center": description === null, "items-start": description !== null },
      props.className,
    )}
  >
    {icon}
    {description === null ? (
      <TileInner>{children}</TileInner>
    ) : (
      <div
        className={classNames("flex flex-col overflow-hidden w-full max-w-full")}
        style={{ gap: sizeToString(descriptionGap, "px") }}
      >
        <TileInner>{children}</TileInner>
        {description}
      </div>
    )}
  </div>
);
