import { ModelImage, type ModelImageProps } from "./ModelImage";

export interface ExperienceImageProps extends Omit<ModelImageProps, "fallbackIcon"> {}

export const ExperienceImage = (props: ExperienceImageProps) => (
  <ModelImage {...({ ...props, fallbackIcon: { name: "briefcase" } } as ModelImageProps)} />
);
