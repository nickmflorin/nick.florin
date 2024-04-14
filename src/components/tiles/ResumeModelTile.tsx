import clsx from "clsx";

import { type ApiEducation, type ApiExperience } from "~/prisma/model";
import { Courses } from "~/components/badges/collections/Courses";
import { Skills } from "~/components/badges/collections/Skills";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography/Description";
import { Label } from "~/components/typography/Label";

import { DetailsTile } from "./DetailsTile";
import { ResumeTileHeader } from "./ResumeTileHeader";

interface ResumeModelTileSectionProps extends ComponentProps {
  readonly children: JSX.Element;
  readonly label: string;
}

const ResumeModelTileSection = ({
  children,
  label,
  ...props
}: ResumeModelTileSectionProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[12px]", props.className)}>
    <Label size="sm">{label}</Label>
    {children}
  </div>
);

export interface ResumeModelTileProps extends ComponentProps {
  readonly model:
    | ApiEducation<["details", "skills", "courses"]>
    | ApiExperience<["details", "skills"]>;
}

export const ResumeModelTile = ({ model, ...props }: ResumeModelTileProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col w-full gap-[10px] max-w-100%", props.className)}>
    <ResumeTileHeader size="large" model={model} />
    <div className="flex flex-col pl-[84px] gap-[12px]">
      <div className="flex flex-col gap-[10px] max-w-[700px]">
        <Description
          fontSize="smplus"
          fontWeight="regular"
          description={
            model.$kind === "education" ? [model.description, model.note] : model.description
          }
        />
        <DetailsTile details={model.details} />
      </div>
      {model.$kind === "education" && model.courses.length !== 0 && (
        <Courses courses={model.courses} className="max-w-[800px]" />
      )}
      {model.skills.length !== 0 && (
        <ResumeModelTileSection label={model.$kind === "education" ? "Skills" : "Other Skills"}>
          <Skills skills={model.skills} className="max-w-[800px]" />
        </ResumeModelTileSection>
      )}
    </div>
  </div>
);

export default ResumeModelTile;
