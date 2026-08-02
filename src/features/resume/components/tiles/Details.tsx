import { type JSX } from 'react';

import { type ApiDetail, type ApiNestedDetail } from '~/database/model';

import { classNames, type ComponentProps } from '~/components/types';
import { type ResumeModelSize } from '~/features/resume/types';

import { Detail } from './Detail';

export interface TopDetailsProps extends ComponentProps {
  readonly details: ApiDetail<['skills', 'nestedDetails']>[];
  readonly isNested?: false;
  readonly size: Exclude<ResumeModelSize, 'small'>;
}

export interface NestedDetailsProps extends ComponentProps {
  readonly details: ApiNestedDetail<['skills']>[];
  readonly isNested: true;
  readonly size: Exclude<ResumeModelSize, 'small'>;
}

export type DetailsProps = NestedDetailsProps | TopDetailsProps;

export const Details = ({
  details,
  isNested,
  size,
  ...props
}: DetailsProps): JSX.Element | null => {
  const filtered = details.filter(d => d.visible !== false);
  if (filtered.length === 0) {
    return null;
  }
  return (
    <div
      {...props}
      className={classNames(
        'flex flex-col',
        {
          'gap-[6px] pl-[12px] max-sm:pl-[4px]': isNested,
          'gap-[10px] max-md:gap-[8px]': isNested !== true,
        },
        props.className,
      )}
    >
      {details
        .filter(d => d.visible !== false)
        .map((detail, i) => (
          <Detail
            detail={detail}
            index={isNested ? i + 1 : undefined}
            isNested={isNested}
            key={detail.id}
            size={size}
          />
        ))}
    </div>
  );
};
