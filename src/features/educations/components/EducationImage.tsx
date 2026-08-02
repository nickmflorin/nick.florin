import { ModelImage, type ModelImageSpreadProps } from '~/components/images/ModelImage';

type BaseEducation = { school: { logoImageUrl: null | string } };

export interface EducationImageProps<E extends BaseEducation> extends Omit<
  ModelImageSpreadProps,
  'fallbackIcon' | 'size' | 'url'
> {
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
    fallbackIcon={{ name: 'school' }}
    size={size}
    url={education.school.logoImageUrl}
  />
);
