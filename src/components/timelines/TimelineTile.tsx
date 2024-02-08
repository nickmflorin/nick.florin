import clsx from "clsx";
import { DateTime } from "luxon";

import { Badge } from "~/components/badges/Badge";
import { Link } from "~/components/buttons";
import { ModelImage, type ModelImageProps } from "~/components/images/ModelImage";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { Title } from "~/components/typography/Title";
import { type Detail, type Skill } from "~/prisma/model";

import { Details } from "./Details";
import { Skills } from "./Skills";

export interface TimelineTileProps extends ComponentProps {
  readonly title: string;
  readonly subTitle: string;
  readonly subTitleHref?: string | null;
  readonly description?: string | null;
  readonly startDate: Date;
  readonly endDate: Date | "postponed" | "current";
  readonly fallbackImageIcon: ModelImageProps["fallbackIcon"];
  readonly imageUrl?: string | null;
  readonly details: Detail[];
  readonly skills: Skill[];
  readonly location: string;
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

const TimelineTileBody = ({
  description,
  details,
}: Pick<TimelineTileProps, "description" | "details">): JSX.Element => (
  <div className="flex flex-col gap-[6px] max-w-[700px]">
    {description && (
      <Text size="md" className="text-gray-600">
        {description}
      </Text>
    )}
    <Details details={details} />
  </div>
);

const TimelineTileSubTitle = ({
  children,
  subTitleHref,
}: Pick<TimelineTileProps, "subTitleHref"> & { readonly children: string }): JSX.Element => {
  if (subTitleHref) {
    return (
      <Link
        href={subTitleHref}
        fontSize="mdl"
        fontFamily="inter"
        fontWeight="medium"
        options={{ as: "a" }}
      >
        {children}
      </Link>
    );
  }
  return (
    <Text size="mdl" fontFamily="inter" fontWeight="medium">
      {children}
    </Text>
  );
};

export const TimelineTile = ({
  title,
  subTitle,
  subTitleHref,
  location,
  description,
  startDate,
  imageUrl,
  endDate,
  fallbackImageIcon,
  skills,
  details,
  ...props
}: TimelineTileProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col w-full gap-[10px] max-w-100%", props.className)}>
    <div className="flex flex-row gap-[8px]">
      <ModelImage size={60} fallbackIcon={fallbackImageIcon} image={{ url: imageUrl }} />
      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[2px] pt-[4px]">
          <Title order={4}>{title}</Title>
          <TimelineTileSubTitle subTitleHref={subTitleHref}>{subTitle}</TimelineTileSubTitle>
        </div>
        <div className="flex flex-row gap-[8px]">
          <Badge size="xs" icon={{ name: "calendar" }} className="font-medium">
            {parseDateInterval(startDate, endDate)}
          </Badge>
          <Badge size="xs" icon={{ name: "location-dot" }} className="font-medium">
            {location}
          </Badge>
        </div>
      </div>
    </div>
    <div className="flex flex-col pl-[68px] gap-[12px]">
      <TimelineTileBody description={description} details={details} />
      <Skills skills={skills} className="max-w-[800px]" />
    </div>
  </div>
);
