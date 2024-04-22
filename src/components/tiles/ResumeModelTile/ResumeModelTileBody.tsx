import clsx from "clsx";

import { type ApiEducation, type ApiExperience, type ResumeBrand } from "~/prisma/model";
import { Courses } from "~/components/badges/collections/Courses";
import { Skills } from "~/components/badges/collections/Skills";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography/Description";
import { Label } from "~/components/typography/Label";

import { DetailsTile } from "./DetailsTile";

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

type ApiModel<T extends ResumeBrand> = {
  education: ApiEducation<["details", "skills", "courses"]>;
  experience: ApiExperience<["details", "skills"]>;
}[T];

export interface ResumeModelTileBodyProps<M extends ApiModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly alignment?: "inset" | "left-aligned";
  readonly model: M;
}

const isNonEmpty = (v: string | null) => typeof v === "string" && v.trim().length !== 0;

const hasDescription = <M extends ApiModel<T>, T extends ResumeBrand>(model: M): boolean => {
  if (model.$kind === "education") {
    return isNonEmpty(model.note) || isNonEmpty(model.description);
  }
  return isNonEmpty(model.description);
};

export const ResumeModelTileBody = <M extends ApiModel<T>, T extends ResumeBrand>({
  model,
  alignment = "inset",
  ...props
}: ResumeModelTileBodyProps<M, T>) => (
  <div
    {...props}
    className={clsx(
      "flex flex-col gap-[12px]",
      // Note: This padding value will have to be adjusted based on the 'size' prop of the header.
      { "pl-[84px]": alignment === "inset" },
      props.className,
    )}
  >
    {(hasDescription(model) || model.details.length !== 0) && (
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
    )}
    {model.$kind === "education" && model.courses.length !== 0 && (
      <Courses courses={model.courses} className="max-w-[800px]" />
    )}
    {model.skills.length !== 0 && (
      <ResumeModelTileSection label={model.$kind === "education" ? "Skills" : "Other Skills"}>
        <Skills skills={model.skills} className="max-w-[800px]" />
      </ResumeModelTileSection>
    )}
  </div>
);
