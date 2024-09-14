import { ModelImage, type ModelImageSpreadProps } from "~/components/images/ModelImage";

type BaseEducation = { school: { logoImageUrl: string | null } };

export interface EducationImageProps<E extends BaseEducation>
  extends Omit<ModelImageSpreadProps, "fallbackIcon" | "url" | "size"> {
  readonly education: E;
  readonly size: number;
}

export const EducationImage = <E extends BaseEducation>({
  education,
  size,
  ...props
}: EducationImageProps<E>) => (
  <ModelImage
    {...props}
    fallbackIcon={{ name: "school" }}
    url={education.school.logoImageUrl}
    size={size}
  />
);
