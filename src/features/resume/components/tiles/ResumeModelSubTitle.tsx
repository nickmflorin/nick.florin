import { type BrandModel, type ResumeBrand } from '~/database/model';

import { classNames, type ComponentProps, type FontWeight } from '~/components/types';
import { LinkOrText } from '~/components/typography/LinkOrText';
import { type ResumeModelSize } from '~/features/resume/types';

const LinkFontWeights: Record<ResumeModelSize, FontWeight> = {
  large: 'medium',
  medium: 'medium',
  small: 'regular',
};

export interface ResumeModelSubTitleProps<
  M extends BrandModel<T>,
  T extends ResumeBrand,
> extends ComponentProps {
  readonly fontWeight?: FontWeight;
  readonly model: M;
  readonly size: ResumeModelSize;
  readonly textClassName?: ComponentProps['className'];
}

export const ResumeModelSubTitle = <M extends BrandModel<T>, T extends ResumeBrand>({
  fontWeight,
  model,
  size,
  textClassName,
  ...props
}: ResumeModelSubTitleProps<M, T>) => (
  <LinkOrText
    {...props}
    className={classNames(
      {
        large: 'text-smplus max-sm:text-sm',
        medium: 'text-smplus',
        small: 'text-sm',
      }[size],
      props.className,
    )}
    fontWeight={fontWeight ?? LinkFontWeights[size]}
    textClassName={textClassName}
    url={model.$kind === 'experience' ? model.company.websiteUrl : model.school.websiteUrl}
  >
    {model.$kind === 'experience' ? model.company.name : model.school.name}
  </LinkOrText>
);
