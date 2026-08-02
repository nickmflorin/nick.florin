import { type JSX, type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

import { Details } from './Details';
import { ResumeModelDescription } from './ResumeModelDescription';
import { ResumeModelHeader } from './ResumeModelHeader';
import { ResumeModelImage } from './ResumeModelImage';
import { ResumeModelSection } from './ResumeModelSection';
import { ResumeModelSubTitle } from './ResumeModelSubTitle';
import { ResumeModelTags } from './ResumeModelTags';
import { ResumeModelTitle } from './ResumeModelTitle';

export interface ResumeModelProps extends ComponentProps {
  readonly children: ReactNode;
}

const LocalResumeModelTile = ({ children, ...props }: ResumeModelProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      '@container/resume-model-tile flex flex-col w-full max-w-100%',
      props.className,
    )}
    data-attr-tour-id='resume-model-tile'
  >
    {children}
  </div>
);

export const ResumeModelTile = Object.assign(LocalResumeModelTile, {
  Details,
  Header: ResumeModelHeader,
  Image: ResumeModelImage,
  ModelDescription: ResumeModelDescription,
  Section: ResumeModelSection,
  SubTitle: ResumeModelSubTitle,
  Tags: ResumeModelTags,
  Title: ResumeModelTitle,
});
