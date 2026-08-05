import { type JSX } from 'react';

import { ShowMoreLink } from '~/components/buttons/ShowMoreLink';
import { classNames, type TypographyVisibilityState } from '~/components/types';

/**
 * Wraps a description with its "show more"/"show less" toggle.
 *
 * Whether the description is actually truncated can only be established by measuring the rendered
 * text after mount, so while collapsed the link is overlaid on the end of the description's last
 * visible line (with a gradient fade masking the text beneath it) rather than occupying its own
 * row. An overlay owns no vertical space, so the measurement's answer cannot shift the
 * surrounding layout — and no blank row is reserved when the text fits.
 *
 * The link is never present at first paint: truncation initializes false (see
 * `useControlledTypographyVisibility`), and even once the measurement confirms truncation the
 * link reveals only on hover or focus of the description — except on hover-incapable (touch)
 * devices, where it is shown outright once confirmed, since it can never be hovered into view.
 *
 * Once expanded — always an explicit user action, never a first-paint state — the "show less"
 * link renders in normal flow beneath the text, where overlaying it would otherwise cover
 * fully-visible content.
 */
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
  isShowMoreLinkVisible ? (
    state === 'expanded' ? (
      <div className='flex flex-col gap-[2px]'>
        {children}
        <ShowMoreLink onClick={onToggle} state={state} />
      </div>
    ) : (
      <div className='group relative'>
        {children}
        <span
          className={classNames(
            'absolute bottom-0 right-0 flex flex-row items-end',
            'bg-gradient-to-l from-white from-[28px] to-transparent pl-[24px]',
            'opacity-0 transition-opacity duration-150',
            'group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100',
            { invisible: !isTruncated },
          )}
        >
          <ShowMoreLink onClick={onToggle} state={state} />
        </span>
      </div>
    )
  ) : (
    children
  );
