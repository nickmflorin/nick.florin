import clsx from "clsx";

import { type ApiDetail, type NestedApiDetail } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { Detail } from "./Detail";

export interface TopDetailsProps extends ComponentProps {
  readonly details: ApiDetail<["skills", "nestedDetails"]>[];
  readonly isNested?: false;
  readonly collapsable?: boolean;
}

export interface NestedDetailsProps extends ComponentProps {
  readonly details: NestedApiDetail<["skills"]>[];
  readonly isNested: true;
  readonly collapsable?: boolean;
}

export type DetailsProps = TopDetailsProps | NestedDetailsProps;

export const Details = ({
  details,
  isNested,
  // TODO: Incorporate collapsable details for purposes of condensed views or mobile viewing.
  collapsable = false,
  ...props
}: DetailsProps): JSX.Element => {
  const filtered = details.filter(d => d.visible !== false);
  if (filtered.length === 0) {
    return <></>;
  }
  return (
    <div
      {...props}
      className={clsx(
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
            detail={detail}
            isNested={isNested}
            index={isNested ? i + 1 : undefined}
          />
        ))}
    </div>
  );
};
