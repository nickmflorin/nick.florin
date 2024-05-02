import clsx from "clsx";

import { type ResumeBrand } from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { type ComponentProps } from "~/components/types";
import { HumanizedCourses } from "~/components/typography/HumanizedCourses";

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
  <ResumeModelTile {...props} className={clsx("gap-[10px]", props.className)}>
    <ResumeModelTile.Header size="medium" model={model} />
    <div className="flex flex-col gap-[12px] overflow-y-auto">
      {(types.hasDescription(model) || model.details.length !== 0) && (
        <div className="flex flex-col gap-[10px] max-w-[700px]">
          <ResumeModelTile.ModelDescription size="medium" model={model} />
          <ResumeModelTile.Details size="medium" details={model.details} />
        </div>
      )}
      {model.$kind === "education" && model.courses.length !== 0 && (
        <ResumeModelTile.Description className="max-w-[800px]" size="medium">
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
