import clsx from "clsx";

import { type ResumeBrand } from "~/prisma/model";
import { Courses } from "~/components/badges/collections/Courses";
import { Skills } from "~/components/badges/collections/Skills";
import { type ComponentProps } from "~/components/types";

import { ResumeModelTile } from "./ResumeModelTile";
import * as types from "./types";

export interface ResumeModelDrawerTileProps<M extends types.ApiModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
}

export const ResumeModelDrawerTile = <M extends types.ApiModel<T>, T extends ResumeBrand>({
  model,
  ...props
}: ResumeModelDrawerTileProps<M, T>) => (
  <ResumeModelTile>
    <div
      {...props}
      className={clsx(
        "flex flex-col gap-[16px] max-w-full w-full overflow-y-hidden",
        props.className,
      )}
    >
      <div className="flex flex-row gap-[12px] max-w-full w-full">
        <ResumeModelTile.Image model={model} size="medium" />
        <div className="flex flex-col grow gap-[4px]">
          <ResumeModelTile.Title model={model} size="medium" />
          <ResumeModelTile.SubTitle model={model} size="medium" />
        </div>
      </div>
      <ResumeModelTile.Badges model={model} />
    </div>
    <div className="flex flex-col gap-[12px] overflow-y-auto">
      {(types.hasDescription(model) || model.details.length !== 0) && (
        <div className="flex flex-col gap-[10px] max-w-[700px]">
          <ResumeModelTile.Description model={model} fontSize="sm" />
          <ResumeModelTile.Details
            details={model.details}
            descriptionFontSize="sm"
            labelFontSize="sm"
            nestedLabelFontSize="sm"
          />
        </div>
      )}
      {model.$kind === "education" && model.courses.length !== 0 && (
        <ResumeModelTile.Section label="Courses" labelFontSize="sm">
          <Courses courses={model.courses} />
        </ResumeModelTile.Section>
      )}
      {model.skills.length !== 0 && (
        <ResumeModelTile.Section
          labelFontSize="sm"
          label={model.$kind === "education" ? "Skills" : "Other Skills"}
        >
          <Skills skills={model.skills} />
        </ResumeModelTile.Section>
      )}
    </div>
  </ResumeModelTile>
);
