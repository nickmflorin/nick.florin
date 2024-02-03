import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";
import { Text } from "~/components/typography/Text";
import { type Detail, type NestedDetail } from "~/prisma/model";

type TopLevelDetail = Detail & { nestedDetails?: NestedDetail[] };
type DetailWithNested = Detail & { nestedDetails: NestedDetail[] };

const detailHasNesting = (detail: TopLevelDetail | NestedDetail): detail is DetailWithNested =>
  ((detail as DetailWithNested).nestedDetails ?? []).filter(d => d.visible !== false).length > 0;

const partitionDetails = <D extends TopLevelDetail | NestedDetail>(details: D[]): D[] => [
  ...details.filter(d => !detailHasNesting(d)),
  ...details.filter(detailHasNesting),
];

const DetailComponent = <D extends TopLevelDetail | NestedDetail>({
  detail,
  index,
}: {
  detail: D;
  index?: number;
}): JSX.Element => (
  <>
    <div className="flex flex-col gap-[2px]">
      {index !== undefined ? (
        <div className="flex flex-row gap-[8px]">
          <Label size="sm" className="w-[8px]">
            {`${index}.`}
          </Label>
          <Label size="sm">{detail.label}</Label>
        </div>
      ) : (
        <Label size="sm">{index !== undefined ? `${index}. ${detail.label}` : detail.label}</Label>
      )}
      {detail.description && (
        <Text size="sm" className={clsx("text-gray-600", { "pl-[16px]": index !== undefined })}>
          {detail.description}
        </Text>
      )}
    </div>
    {detailHasNesting(detail) && <Details details={detail.nestedDetails} isNested={true} />}
  </>
);

export interface TopDetailsProps extends ComponentProps {
  readonly details: TopLevelDetail[];
  readonly isNested?: false;
}

export interface NestedDetailsProps extends ComponentProps {
  readonly details: NestedDetail[];
  readonly isNested: true;
}

export type DetailsProps = TopDetailsProps | NestedDetailsProps;

export const Details = ({ details, isNested, ...props }: DetailsProps): JSX.Element => (
  <div
    {...props}
    className={clsx(
      "flex flex-col",
      { "gap-[8px]": isNested !== true, "gap-[4px] pl-[6px]": isNested },
      props.className,
    )}
  >
    {partitionDetails(details as (TopLevelDetail | NestedDetail)[])
      .filter(d => d.visible !== false)
      .map((detail, i) => (
        <DetailComponent key={detail.id} detail={detail} index={isNested ? i + 1 : undefined} />
      ))}
  </div>
);
