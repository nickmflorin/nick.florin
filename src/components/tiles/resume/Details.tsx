import { type ApiDetail, type NestedApiDetail } from "~/prisma/model";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

import { Detail } from "./Detail";
import { type ResumeModelSize } from "./types";

export interface TopDetailsProps extends ComponentProps {
  readonly details: ApiDetail<["skills", "nestedDetails"]>[];
  readonly isNested?: false;
  readonly size: Exclude<ResumeModelSize, "small">;
}

export interface NestedDetailsProps extends ComponentProps {
  readonly details: NestedApiDetail<["skills"]>[];
  readonly isNested: true;
  readonly size: Exclude<ResumeModelSize, "small">;
}

export type DetailsProps = TopDetailsProps | NestedDetailsProps;

export const Details = ({ details, size, isNested, ...props }: DetailsProps): JSX.Element => {
  const filtered = details.filter(d => d.visible !== false);
  if (filtered.length === 0) {
    return <></>;
  }
  return (
    <div
      {...props}
      className={classNames(
        "flex flex-col",
        { "gap-[10px] max-md:gap-[8px]": isNested !== true, "gap-[6px] pl-[12px]": isNested },
        props.className,
      )}
    >
      {details
        .filter(d => d.visible !== false)
        .map((detail, i) => (
          <Detail
            key={detail.id}
            size={size}
            detail={detail}
            isNested={isNested}
            index={isNested ? i + 1 : undefined}
          />
        ))}
    </div>
  );
};
