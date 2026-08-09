import { type BrandModel, type ResumeBrand } from '~/database/model';

import { type IconProp } from '~/components/icons';
import { Avatar, type AvatarProps } from '~/components/images/Avatar';

export interface ResumeModelImageProps<M extends BrandModel<T>, T extends ResumeBrand> extends Omit<
  AvatarProps,
  'fallbackIcon' | 'icon' | 'src'
> {
  readonly model: M;
}

export const ResumeModelImage = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  ...props
}: ResumeModelImageProps<M, T>) => {
  const icon: IconProp =
    model.$kind === 'experience' ? { name: 'briefcase' } : { name: 'building-columns' };
  return (
    <Avatar
      {...props}
      fallbackIcon={icon}
      icon={icon}
      /* Company and school logos are squared off, where the avatar's own default is a circle. */
      radius={props.radius ?? 'none'}
      src={model.$kind === 'experience' ? model.company.logoImageUrl : model.school.logoImageUrl}
    />
  );
};
