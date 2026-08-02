import { type JSX } from 'react';

import { ShowMoreLink } from '~/components/buttons/ShowMoreLink';
import { type TypographyVisibilityState } from '~/components/types';

export const WithShowMore = ({
  children,
  isShowMoreLinkVisible = false,
  isTruncated,
  onToggle,
  state,
}: {
  readonly children: JSX.Element;
  readonly isShowMoreLinkVisible?: boolean;
  readonly isTruncated: boolean;
  readonly onToggle: () => void;
  readonly state: TypographyVisibilityState;
}) =>
  isShowMoreLinkVisible && isTruncated ? (
    <div className='flex flex-col gap-[2px]'>
      {children}
      <ShowMoreLink onClick={onToggle} state={state} />
    </div>
  ) : (
    children
  );
