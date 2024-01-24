import { ModelImage, type ModelImageProps } from "./ModelImage";

export interface EducationImageProps extends Omit<ModelImageProps, "fallbackIcon"> {}

export const EducationImage = (props: EducationImageProps) => (
  <ModelImage {...({ ...props, fallbackIcon: { name: "school" } } as ModelImageProps)} />
);
