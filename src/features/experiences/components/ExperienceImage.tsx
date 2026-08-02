import { ModelImage, type ModelImageSpreadProps } from '~/components/images/ModelImage';

type BaseExperience = { company: { logoImageUrl: null | string } };

export interface ExperienceImageProps<E extends BaseExperience> extends Omit<
  ModelImageSpreadProps,
  'fallbackIcon' | 'size' | 'url'
> {
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
    fallbackIcon={{ name: 'briefcase' }}
    size={size}
    url={experience.company.logoImageUrl}
  />
);
