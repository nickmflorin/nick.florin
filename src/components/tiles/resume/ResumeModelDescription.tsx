import { type ResumeBrand, type BrandModel } from "~/prisma/model";
import { Description, type DescriptionProps } from "~/components/typography/Description";

import * as types from "./types";

export interface ResumeModelDescriptionProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends DescriptionProps {
  readonly model: M;
}

export const ResumeModelDescription = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  ...props
}: ResumeModelDescriptionProps<M, T>) => {
  if (types.hasDescription(model)) {
    return (
      <Description
        fontSize="smplus"
        fontWeight="regular"
        {...props}
        description={
          model.$kind === "education" ? [model.description, model.note] : model.description
        }
      />
    );
  }
  return <></>;
};
