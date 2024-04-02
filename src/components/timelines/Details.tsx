import clsx from "clsx";

import { type ApiDetail, type NestedApiDetail } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { Detail } from "./Detail";

export interface TopDetailsProps extends ComponentProps {
  readonly details: ApiDetail<{ nestedDetails: true; skills: true }>[];
  readonly isNested?: false;
}

export interface NestedDetailsProps extends ComponentProps {
  readonly details: NestedApiDetail<{ skills: true }>[];
  readonly isNested: true;
}

export type DetailsProps = TopDetailsProps | NestedDetailsProps;

export const Details = ({ details, isNested, ...props }: DetailsProps): JSX.Element => {
  const filtered = details.filter(d => d.visible !== false);
  if (filtered.length === 0) {
    return <></>;
  }
  return (
    <div
      {...props}
      className={clsx(
        "flex flex-col",
        { "gap-[12px]": isNested !== true, "gap-[6px] pl-[12px]": isNested },
        props.className,
      )}
    >
      {details
        .filter(d => d.visible !== false)
        .map((detail, i) => (
          <Detail
            key={detail.id}
            detail={detail}
            index={isNested ? i + 1 : undefined}
            textSize={isNested ? "sm" : "smplus"}
          />
        ))}
    </div>
  );
};
