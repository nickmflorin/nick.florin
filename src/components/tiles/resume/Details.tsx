import clsx from "clsx";

import { type ApiDetail, type NestedApiDetail } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";
import { type FontSize } from "~/components/typography";

import { Detail } from "./Detail";

export interface TopDetailsProps extends ComponentProps {
  readonly details: ApiDetail<["skills", "nestedDetails"]>[];
  readonly isNested?: false;
  readonly collapsable?: boolean;
  readonly descriptionFontSize?: FontSize;
  readonly labelFontSize?: FontSize;
  readonly nestedLabelFontSize?: FontSize;
}

export interface NestedDetailsProps extends ComponentProps {
  readonly details: NestedApiDetail<["skills"]>[];
  readonly isNested: true;
  readonly collapsable?: boolean;
  readonly descriptionFontSize?: FontSize;
  readonly labelFontSize?: FontSize;
  readonly nestedLabelFontSize?: FontSize;
}

export type DetailsProps = TopDetailsProps | NestedDetailsProps;

export const Details = ({
  details,
  isNested,
  collapsable = false,
  labelFontSize = "smplus",
  nestedLabelFontSize = "sm",
  descriptionFontSize,
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
        { "gap-[10px]": isNested !== true, "gap-[6px] pl-[12px]": isNested },
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
            labelFontSize={isNested ? nestedLabelFontSize : labelFontSize}
            descriptionFontSize={descriptionFontSize}
          />
        ))}
    </div>
  );
};
