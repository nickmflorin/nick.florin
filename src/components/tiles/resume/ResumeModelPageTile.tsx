import clsx from "clsx";

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
  <ResumeModelTile {...props} className={clsx("gap-[10px] max-md:gap-[8px]")}>
    <ResumeModelTile.Header size="large" model={model} />
    <div className="flex flex-col gap-[10px] sm:pl-[84px]">
      {(types.hasDescription(model) || model.details.length !== 0) && (
        <div className="flex flex-col gap-[10px] max-w-[700px]">
          <ResumeModelTile.Description model={model} size="large" />
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
