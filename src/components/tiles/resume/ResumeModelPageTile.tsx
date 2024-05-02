import clsx from "clsx";

import { type ResumeBrand } from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { type ComponentProps } from "~/components/types";
import { HumanizedCourses } from "~/components/typography/HumanizedCourses";

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
          <ResumeModelTile.ModelDescription size="large" model={model} />
          <ResumeModelTile.Details size="large" details={model.details} />
        </div>
      )}
      {model.$kind === "education" && model.courses.length !== 0 && (
        <ResumeModelTile.Description className="max-w-[800px]" size="large">
          <HumanizedCourses courses={model.courses} />
        </ResumeModelTile.Description>
      )}
      {model.skills.length !== 0 ? (
        model.$kind === "experience" ? (
          <ResumeModelTile.Section label="Other Skills">
            <Skills skills={model.skills} className="max-w-[800px]" />
          </ResumeModelTile.Section>
        ) : (
          <Skills skills={model.skills} className="max-w-[800px]" />
        )
      ) : (
        <></>
      )}
    </div>
  </ResumeModelTile>
);
