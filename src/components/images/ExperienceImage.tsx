import { ModelImage, type ModelImageSpreadProps } from "./ModelImage";

type BaseExperience = { company: { logoImageUrl: string | null } };

export interface ExperienceImageProps<E extends BaseExperience>
  extends Omit<ModelImageSpreadProps, "fallbackIcon" | "url" | "size"> {
  readonly experience: E;
  readonly size: number;
}

export const ExperienceImage = <E extends BaseExperience>({
  experience,
  size,
  ...props
}: ExperienceImageProps<E>) => (
  <ModelImage
    {...props}
    fallbackIcon={{ name: "briefcase" }}
    url={experience.company.logoImageUrl}
    size={size}
  />
);
