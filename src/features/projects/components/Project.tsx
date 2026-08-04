import { type JSX } from 'react';

import { type ApiProject } from '~/database/model';

import { Badge } from '~/components/badges/Badge';
import { classNames, type ComponentProps } from '~/components/types';
import { Title } from '~/components/typography';
import { RepositoryTile } from '~/features/repositories/components/RepositoryTile';
import { Skills } from '~/features/skills/components/badges';

import { Disclaimer } from './Disclaimer';

export interface ProjectProps extends ComponentProps {
  readonly children: JSX.Element | JSX.Element[];
  readonly description: JSX.Element;
  readonly disclaimer?: JSX.Element;
  readonly isUnderConstruction?: boolean;
  readonly project: ApiProject<['skills', 'repositories']>;
  readonly title: string;
}

export const Project = ({
  children,
  description,
  disclaimer,
  isUnderConstruction,
  project,
  title,
  ...props
}: ProjectProps) => (
  <div
    {...props}
    className={classNames(
      'w-full max-w-[900px] flex flex-col gap-[12px] mx-auto px-[16px] pb-[16px]',
      'max-md:gap-[8px] px-[12px] pb-[12px]',
      'px-[8px] pb-[8px]',
      props.className,
    )}
  >
    <div
      {...props}
      className={classNames('w-full flex flex-col gap-[12px] max-md:gap-[8px]', props.className)}
    >
      <div
        className={classNames(
          'flex flex-row sm:items-center gap-4',
          'max-sm:flex-col max-sm:items-start max-sm:gap-2',
        )}
      >
        <Title className='max-md:text-title-sm max-w-fit' component='h3'>
          {title}
        </Title>
        {isUnderConstruction ? (
          <Badge className='bg-yellow-100 border-yellow-400'>Page Under Construction</Badge>
        ) : null}
      </div>
      <div className='flex flex-col gap-[16px] max-md:gap-[12px]'>
        {description}
        {project.repositories.length === 0 ? null : (
          <div className='flex flex-row gap-[10px] mb-2 max-sm:flex-col'>
            {project.repositories.map((repo, index) => (
              <RepositoryTile key={index} repository={repo} />
            ))}
          </div>
        )}
        {disclaimer ? <Disclaimer className='mb-2'>{disclaimer}</Disclaimer> : null}
        <Skills className='mb-2' skills={project.skills} />
      </div>
    </div>
    <div className='flex flex-col gap-[12px] max-md:gap-[8px]' key='1'>
      {children}
    </div>
  </div>
);
