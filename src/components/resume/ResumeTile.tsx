import clsx from "clsx";
import { DateTime } from "luxon";

import { ModelImage, type ModelImageProps } from "~/components/images/ModelImage";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { Title } from "~/components/typography/Title";
import { type Detail, type Skill } from "~/prisma/model";

import { Label } from "../typography/Label";

export interface ResumeTileProps extends ComponentProps {
  readonly title: string;
  readonly subTitle: string;
  readonly description?: string | null;
  readonly startDate: Date;
  readonly endDate: Date | "postponed" | "current";
  readonly fallbackImageIcon: ModelImageProps["fallbackIcon"];
  readonly imageUrl?: string | null;
  readonly details: Detail[];
  readonly skills: Skill[];
}

const parseDateInterval = (startDate: Date, endDate: Date | "postponed" | "current"): string => {
  const start = `${DateTime.fromJSDate(startDate).monthLong} ${
    DateTime.fromJSDate(startDate).year
  }`;
  const end =
    endDate === "postponed"
      ? "Postponed"
      : endDate === "current"
        ? "Current"
        : `${DateTime.fromJSDate(endDate).monthLong} ${DateTime.fromJSDate(endDate).year}`;
  return `${start} - ${end}`;
};

const ResumeTileDetail = ({
  detail,
}: {
  detail: ResumeTileProps["details"][number];
}): JSX.Element => (
  <div className="flex flex-col gap-[2px]">
    <Label size="sm">{detail.label}</Label>
    <Text size="sm" className="text-gray-600">
      {detail.description}
    </Text>
  </div>
);

const ResumeTileDetails = ({ details }: Pick<ResumeTileProps, "details">): JSX.Element => (
  <div className="flex flex-col gap-[8px]">
    {details
      .filter(d => d.visible !== false)
      .map(detail => (
        <ResumeTileDetail key={detail.id} detail={detail} />
      ))}
  </div>
);

const ResumeTileBody = ({
  description,
  startDate,
  endDate,
  details,
  skills,
}: Pick<
  ResumeTileProps,
  "description" | "startDate" | "endDate" | "skills" | "details"
>): JSX.Element => (
  <div className="flex flex-col pl-[68px] gap-[6px]">
    {description && (
      <Text size="sm" className="text-gray-600">
        {description}
      </Text>
    )}
    <Text size="sm" className="text-body tracking-tighter font-medium">
      {parseDateInterval(startDate, endDate)}
    </Text>
    <ResumeTileDetails details={details} />
  </div>
);

export const ResumeTile = ({
  title,
  subTitle,
  description,
  startDate,
  imageUrl,
  endDate,
  fallbackImageIcon,
  skills,
  details,
  ...props
}: ResumeTileProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col w-full gap-[6px] max-w-100%", props.className)}>
    <div className="flex flex-row gap-[8px]">
      <ModelImage size={60} fallbackIcon={fallbackImageIcon} image={{ url: imageUrl }} />
      <div className="flex flex-col gap-[2px] h-[60px] pt-[4px]">
        <Title order={4}>{title}</Title>
        <Title order={5}>{subTitle}</Title>
      </div>
    </div>
    <ResumeTileBody
      description={description}
      startDate={startDate}
      endDate={endDate}
      details={details}
      skills={skills}
    />
  </div>
);
