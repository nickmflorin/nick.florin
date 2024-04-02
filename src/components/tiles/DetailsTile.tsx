import clsx from "clsx";

import { type ApiDetail, type NestedApiDetail } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { DetailTile } from "./DetailTile";

export interface TopDetailsTileProps extends ComponentProps {
  readonly details: ApiDetail<{ nestedDetails: true; skills: true }>[];
  readonly isNested?: false;
}

export interface NestedDetailsTileProps extends ComponentProps {
  readonly details: NestedApiDetail<{ skills: true }>[];
  readonly isNested: true;
}

export type DetailsTileProps = TopDetailsTileProps | NestedDetailsTileProps;

export const DetailsTile = ({ details, isNested, ...props }: DetailsTileProps): JSX.Element => {
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
          <DetailTile
            key={detail.id}
            detail={detail}
            index={isNested ? i + 1 : undefined}
            textSize={isNested ? "sm" : "smplus"}
          />
        ))}
    </div>
  );
};
