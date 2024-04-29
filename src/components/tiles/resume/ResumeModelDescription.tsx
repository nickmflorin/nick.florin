import clsx from "clsx";

import { type ResumeBrand, type BrandModel } from "~/prisma/model";
import { Description, type DescriptionProps } from "~/components/typography/Description";

import * as types from "./types";

export interface ResumeModelDescriptionProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends Omit<DescriptionProps, "children"> {
  readonly model: M;
  readonly size: types.ResumeModelSize;
}

export const ResumeModelDescription = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  ...props
}: ResumeModelDescriptionProps<M, T>) => {
  if (types.hasDescription(model)) {
    return (
      <Description
        fontWeight="regular"
        {...props}
        className={clsx(
          {
            "text-smplus max-sm:text-sm": ["medium", "large"].includes(size),
            "text-sm": size === "small",
          },
          props.className,
        )}
      >
        {model.$kind === "education" ? [model.description, model.note] : model.description}
      </Description>
    );
  }
  return <></>;
};
