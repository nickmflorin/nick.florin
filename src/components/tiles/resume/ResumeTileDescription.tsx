import clsx from "clsx";

import type * as types from "./types";

import { Description, type DescriptionProps } from "~/components/typography/Description";

export interface ResumeTileDescriptionProps extends DescriptionProps {
  readonly size: types.ResumeModelSize;
}

export const ResumeTileDescription = ({ size, children, ...props }: ResumeTileDescriptionProps) => (
  <Description
    fontWeight="regular"
    {...props}
    className={clsx(
      {
        "text-smplus max-sm:text-sm": ["medium", "large"].includes(size),
        "text-sm": size === "small",
      },
      props.className,
    )}
  >
    {children}
  </Description>
);
