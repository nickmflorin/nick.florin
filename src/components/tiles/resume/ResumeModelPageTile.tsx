import { type ResumeBrand } from "~/prisma/model";
import { Courses } from "~/components/badges/collections/Courses";
import { Skills } from "~/components/badges/collections/Skills";
import { type ComponentProps } from "~/components/types";

import { ResumeModelTile } from "./ResumeModelTile";
import * as types from "./types";

export interface ResumeModelPageTileProps<M extends types.ApiModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
}

export const ResumeModelPageTile = <M extends types.ApiModel<T>, T extends ResumeBrand>({
  model,
  ...props
}: ResumeModelPageTileProps<M, T>) => (
  <ResumeModelTile {...props}>
    <div className="flex flex-col gap-[16px] max-w-full w-full">
      <div className="flex flex-row gap-[12px] max-w-full w-full">
        <ResumeModelTile.Image model={model} size="large" />
        <div className="flex flex-col grow gap-[8px] pt-[4px]">
          <ResumeModelTile.Title model={model} size="large" />
          <ResumeModelTile.SubTitle model={model} size="large" />
          <ResumeModelTile.Badges model={model} />
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-[12px] pl-[84px]">
      {(types.hasDescription(model) || model.details.length !== 0) && (
        <div className="flex flex-col gap-[10px] max-w-[700px]">
          <ResumeModelTile.Description model={model} />
          <ResumeModelTile.Details details={model.details} />
        </div>
      )}
      {model.$kind === "education" && model.courses.length !== 0 && (
        <ResumeModelTile.Section label="Courses">
          <Courses courses={model.courses} className="max-w-[800px]" />
        </ResumeModelTile.Section>
      )}
      {model.skills.length !== 0 && (
        <ResumeModelTile.Section label={model.$kind === "education" ? "Skills" : "Other Skills"}>
          <Skills skills={model.skills} className="max-w-[800px]" />
        </ResumeModelTile.Section>
      )}
    </div>
  </ResumeModelTile>
);
