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
  <ResumeModelTile {...props}>
    <ResumeModelTile.Header size="medium" model={model} insetBadges />
    <div className="flex flex-col gap-[12px] overflow-y-auto">
      {(types.hasDescription(model) || model.details.length !== 0) && (
        <div className="flex flex-col gap-[10px] max-w-[700px]">
          <ResumeModelTile.Description model={model} size="medium" />
          <ResumeModelTile.Details details={model.details} />
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
