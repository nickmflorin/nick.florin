import { type ResumeBrand, type BrandModel } from "~/prisma/model";

import { ResumeTileDescription, type ResumeTileDescriptionProps } from "./ResumeTileDescription";
import * as types from "./types";

export interface ResumeModelDescriptionProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends Omit<ResumeTileDescriptionProps, "children"> {
  readonly model: M;
}

export const ResumeModelDescription = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  ...props
}: ResumeModelDescriptionProps<M, T>) => {
  if (types.hasDescription(model)) {
    return (
      <ResumeTileDescription {...props}>
        {model.$kind === "education" ? [model.description, model.note] : model.description}
      </ResumeTileDescription>
    );
  }
  return <></>;
};
