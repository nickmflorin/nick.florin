import clsx from "clsx";

import { type ModelLocation, type Detail, type Skill, type ModelTimePeriod } from "~/prisma/model";
import { LocationBadge } from "~/components/badges/LoocationBadge";
import { TimePeriodBadge } from "~/components/badges/TimePeriodBadge";
import { ModelImage, type ModelImageProps } from "~/components/images/ModelImage";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography/Description";
import { LinkOrText } from "~/components/typography/LinkOrText";
import { Title } from "~/components/typography/Title";

import { Details } from "./Details";
import { Skills } from "./Skills";

export interface TimelineTileProps extends ComponentProps {
  readonly title: string;
  readonly name: string;
  readonly websiteUrl?: string | null;
  readonly description?: (string | null)[];
  readonly location: ModelLocation;
  readonly timePeriod: ModelTimePeriod;
  readonly fallbackImageIcon: ModelImageProps["fallbackIcon"];
  readonly imageUrl?: string | null;
  readonly details: Detail[];
  readonly skills: Skill[];
}

const TimelineTileBody = ({
  description,
  details,
}: Pick<TimelineTileProps, "description" | "details">): JSX.Element => (
  <div className="flex flex-col gap-[6px] max-w-[700px]">
    <Description description={description} />
    <Details details={details} />
  </div>
);

export const TimelineTile = ({
  title,
  websiteUrl,
  name,
  location,
  description,
  timePeriod,
  imageUrl,
  fallbackImageIcon,
  skills,
  details,
  ...props
}: TimelineTileProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col w-full gap-[10px] max-w-100%", props.className)}>
    <div className="flex flex-row gap-[10px]">
      <ModelImage size={72} fallbackIcon={fallbackImageIcon} image={{ url: imageUrl }} />
      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[4px] pt-[4px]">
          <Title order={2}>{title}</Title>
          <LinkOrText url={websiteUrl} tooltip="View website">
            {name}
          </LinkOrText>
        </div>
        <div className="flex flex-row gap-[8px]">
          <TimePeriodBadge timePeriod={timePeriod} />
          <LocationBadge location={location} />
        </div>
      </div>
    </div>
    <div className="flex flex-col pl-[82px] gap-[12px]">
      <TimelineTileBody description={description} details={details} />
      {skills.length !== 0 && <Skills skills={skills} className="max-w-[800px]" />}
    </div>
  </div>
);

export default TimelineTile;
