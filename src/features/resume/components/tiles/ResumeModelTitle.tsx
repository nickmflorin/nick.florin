import { type JSX } from 'react';

import { type BrandModel, Degrees, type ResumeBrand } from '~/database/model';

import { ExpandResumeModelButton } from '~/components/buttons/ExpandResumeModelButton';
import { classNames, type ComponentProps } from '~/components/types';
import { Text, Title } from '~/components/typography';
import { ShowHide } from '~/components/util';
import { type ResumeModelSize } from '~/features/resume/types';

const Titles: Record<ResumeModelSize, ({ children }: { children: string }) => JSX.Element> = {
  large: ({ children }) => (
    <Title
      className={classNames(
        'leading-[22px] text-title-md',
        'max-md:leading-[22px] max-md:text-title-smplus',
        'max-sm:text-title-sm max-sm:leading-[22px]',
      )}
      component='h2'
    >
      {children}
    </Title>
  ),
  medium: ({ children }) => (
    <Title className='leading-[22px] max-sm:text-title-sm max-sm:leading-[22px]' component='h3'>
      {children}
    </Title>
  ),
  small: ({ children }) => (
    <Text
      className='leading-[22px] max-sm:text-smplus max-sm:leading-[22px]'
      fontSize='md'
      fontWeight='medium'
    >
      {children}
    </Text>
  ),
};

export interface ResumeModelTitleProps<
  M extends BrandModel<T>,
  T extends ResumeBrand,
> extends ComponentProps {
  readonly isExpandable?: boolean;
  readonly model: M;
  readonly size: ResumeModelSize;
}

export const ResumeModelTitle = <M extends BrandModel<T>, T extends ResumeBrand>({
  isExpandable = false,
  model,
  size,
  ...props
}: ResumeModelTitleProps<M, T>) => {
  const TitleComponent = Titles[size];
  return (
    <div
      {...props}
      className={classNames(
        'flex flex-row justify-between items-center w-full gap-[8px]',
        props.className,
      )}
    >
      <TitleComponent>
        {model.$kind === 'experience'
          ? model.title
          : `${Degrees.getModel(model.degree).shortLabel} in ${model.major}`}
      </TitleComponent>
      <ShowHide show={isExpandable}>
        <ExpandResumeModelButton
          modelId={model.id}
          modelType={model.$kind}
          tourId='expand-button'
        />
      </ShowHide>
    </div>
  );
};
