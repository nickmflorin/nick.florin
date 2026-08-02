import { type ReactNode } from 'react';

import { type IconName, type IconProp, type IconSize } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import { classNames, type ComponentProps } from '~/components/types';
import { Description } from '~/components/typography';

import { ResumeSimpleTileScaffold } from './ResumeSimpleTileScaffold';

export interface ResumeSimpleTileProps extends ComponentProps {
  readonly children: ReactNode;
  readonly description: null | string;
  readonly icon: IconName | IconProp;
  readonly iconClassName?: ComponentProps['className'];
  readonly iconSize?: IconSize;
}

export const ResumeSimpleTile = ({
  children,
  description,
  icon,
  iconClassName,
  iconSize,
  ...props
}: ResumeSimpleTileProps) => (
  <ResumeSimpleTileScaffold
    {...props}
    description={
      description !== null && description.trim().length !== 0 ? (
        <Description isShowMoreLinkVisible lineClamp={3}>
          {description}
        </Description>
      ) : null
    }
    icon={
      <Icon
        className={classNames('text-gray-700', iconClassName)}
        icon={icon}
        size={iconSize ?? 22}
      />
    }
  >
    {children}
  </ResumeSimpleTileScaffold>
);
