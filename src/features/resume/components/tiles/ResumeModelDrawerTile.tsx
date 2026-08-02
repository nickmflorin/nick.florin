import { type ResumeBrand } from '~/database/model';

import { classNames, type ComponentProps } from '~/components/types';
import { Description } from '~/components/typography';
import { HumanizedCourses } from '~/features/courses/components/HumanizedCourses';
import * as types from '~/features/resume/types';
import { Skills } from '~/features/skills/components/badges';

import { ResumeModelTile } from './ResumeModelTile';

export interface ResumeModelDrawerTileProps<
  M extends types.ApiModel<T>,
  T extends ResumeBrand,
> extends ComponentProps {
  readonly model: M;
  readonly titleProps?: ComponentProps;
}

export const ResumeModelDrawerTile = <M extends types.ApiModel<T>, T extends ResumeBrand>({
  model,
  titleProps,
  ...props
}: ResumeModelDrawerTileProps<M, T>) => (
  <ResumeModelTile {...props} className={classNames('gap-[10px]', props.className)}>
    <ResumeModelTile.Header model={model} size='medium' titleProps={titleProps} />
    <div className='flex flex-col gap-[12px] overflow-y-auto'>
      {(types.hasDescription(model) || model.details.length !== 0) && (
        <div className='flex flex-col gap-[10px] max-w-[700px]'>
          <ResumeModelTile.ModelDescription model={model} />
          <ResumeModelTile.Details details={model.details} size='medium' />
        </div>
      )}
      {model.$kind === 'education' && model.courses.length !== 0 && (
        <Description className='max-w-[800px]'>
          <HumanizedCourses courses={model.courses} />
        </Description>
      )}
      {model.skills.length !== 0 &&
        (model.$kind === 'experience' ? (
          <ResumeModelTile.Section label='Other Skills'>
            <Skills className='max-w-[800px]' skills={model.skills} />
          </ResumeModelTile.Section>
        ) : (
          <Skills className='max-w-[800px]' skills={model.skills} />
        ))}
    </div>
  </ResumeModelTile>
);
