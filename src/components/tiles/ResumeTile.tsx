import clsx from "clsx";

import { type ApiEducation, type ApiExperience } from "~/prisma/model";
import { Courses } from "~/components/badges/collections/Courses";
import { Skills } from "~/components/badges/collections/Skills";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography/Description";
import { Label } from "~/components/typography/Label";

import { DetailsTile } from "./DetailsTile";
import { ResumeTileHeader } from "./ResumeTileHeader";

interface ResumeTileSectionProps extends ComponentProps {
  readonly children: JSX.Element;
  readonly label: string;
}

const ResumeTileSection = ({ children, label, ...props }: ResumeTileSectionProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[12px]", props.className)}>
    <div className="flex flex-col gap-[6px]">
      <hr className="border-t border-gray-300 max-w-[700px]" />
      <Label size="sm" className="text-body-light">
        {label}
      </Label>
    </div>
    {children}
  </div>
);

export interface ResumeTileProps extends ComponentProps {
  readonly model:
    | ApiEducation<["details", "skills", "courses"]>
    | ApiExperience<["details", "skills"]>;
}

export const ResumeTile = ({ model, ...props }: ResumeTileProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col w-full gap-[10px] max-w-100%", props.className)}>
    <ResumeTileHeader size="large" model={model} />
    <div className="flex flex-col pl-[84px] gap-[12px]">
      <div className="flex flex-col gap-[6px] max-w-[700px]">
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
        <ResumeTileSection label={model.$kind === "education" ? "Skills" : "Other Skills"}>
          <Skills skills={model.skills} className="max-w-[800px]" />
        </ResumeTileSection>
      )}
    </div>
  </div>
);

export default ResumeTile;
