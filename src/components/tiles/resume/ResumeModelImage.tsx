import { type BrandModel, type ResumeBrand } from "~/prisma/model";
import { ModelImage, type ModelImageSpreadProps } from "~/components/images/ModelImage";

import { type ResumeModelSize, ImageSizes } from "./types";

export interface ResumeModelImageProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends Omit<ModelImageSpreadProps, "fallbackIcon" | "url" | "size"> {
  readonly model: M;
  readonly size: ResumeModelSize | number;
}

export const ResumeModelImage = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  ...props
}: ResumeModelImageProps<M, T>) => (
  <ModelImage
    {...props}
    fallbackIcon={
      model.$kind === "experience" ? { name: "briefcase" } : { name: "building-columns" }
    }
    url={model.$kind === "experience" ? model.company.logoImageUrl : model.school.logoImageUrl}
    size={typeof size === "number" ? size : ImageSizes[size]}
  />
);
