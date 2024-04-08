import clsx from "clsx";

import {
  type ModelLocation,
  type Skill,
  type ModelTimePeriod,
  type ApiDetail,
} from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { ModelImage, type ModelImageProps } from "~/components/images/ModelImage";
import { LocationTag } from "~/components/tags/LocationTag";
import { TimePeriodTag } from "~/components/tags/TimePeriodTag";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography/Description";
import { Label } from "~/components/typography/Label";
import { LinkOrText } from "~/components/typography/LinkOrText";
import { Title } from "~/components/typography/Title";

import { DetailsTile } from "./DetailsTile";

export interface ResumeTileProps extends ComponentProps {
  readonly title: string;
  readonly name: string;
  readonly websiteUrl?: string | null;
  readonly description?: (string | null)[];
  readonly location: ModelLocation;
  readonly timePeriod: ModelTimePeriod;
  readonly fallbackImageIcon: ModelImageProps["fallbackIcon"];
  readonly imageUrl?: string | null;
  readonly details: ApiDetail<["skills", "nestedDetails"]>[];
  readonly skills: Skill[];
}

const ResumeTileBody = ({
  description,
  details,
  skills,
}: Pick<ResumeTileProps, "description" | "details" | "skills">): JSX.Element => (
  <div className="flex flex-col pl-[82px] gap-[12px]">
    <div className="flex flex-col gap-[6px] max-w-[700px]">
      <Description fontSize="smplus" description={description} />
      <DetailsTile details={details} />
    </div>
    {skills.length !== 0 && (
      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[6px]">
          <hr className="border-t border-gray-300 max-w-[700px]" />
          <Label size="sm" className="text-body-light">
            Additional Skills
          </Label>
        </div>
        <Skills skills={skills} className="max-w-[800px]" />
      </div>
    )}
  </div>
);

export const ResumeTile = ({
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
}: ResumeTileProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col w-full gap-[10px] max-w-100%", props.className)}>
    <div className="flex flex-row gap-[10px]">
      <ModelImage size={72} fallbackIcon={fallbackImageIcon} image={{ url: imageUrl }} />
      <div className="flex flex-col gap-[8px]">
        <div className="flex flex-col gap-[4px] pt-[4px]">
          <Title order={2}>{title}</Title>
          <LinkOrText url={websiteUrl}>{name}</LinkOrText>
        </div>
        <div className="flex flex-row gap-[8px] items-center">
          <TimePeriodTag timePeriod={timePeriod} />
          <LocationTag location={location} />
        </div>
      </div>
    </div>
    <ResumeTileBody description={description} details={details} skills={skills} />
  </div>
);

export default ResumeTile;
