import React, { type ReactNode } from "react";

import { Skeleton } from "~/components/loading/Skeleton";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";

import { CaptionDescription } from "./CaptionDescription";

export interface CaptionProps extends ComponentProps {
  readonly children: ReactNode;
  readonly isLoading: boolean;
  readonly centered?: boolean;
}

export const Caption = ({ children, centered, isLoading, ...props }: CaptionProps) => (
  <div
    {...props}
    className={classNames("relative flex flex-col w-full items-center", props.className)}
  >
    <div
      className={classNames(
        "flex flex-col items-center gap-[6px]",
        "max-w-[90%] min-w-[90%] max-md:max-w-full max-md:min-w-full",
      )}
    >
      <ShowHide show={isLoading}>
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="100%" />
      </ShowHide>
      <ShowHide show={!isLoading}>
        {(Array.isArray(children) ? children : [children]).map((c, index) =>
          typeof c === "string" ? (
            <CaptionDescription key={index} centered={centered}>
              {c}
            </CaptionDescription>
          ) : (
            <React.Fragment key={index}>{c}</React.Fragment>
          ),
        )}
      </ShowHide>
    </div>
  </div>
);
