import { type JSX } from 'react';

import { getPrimaryResume } from '~/actions/resumes/get-primary-resume';

import { Button } from '~/components/buttons/generic/Button';
import { IconButton } from '~/components/buttons/generic/IconButton';
import { SiteResumeActionsElementId } from '~/components/constants';
import { classNames, type ComponentProps } from '~/components/types';

export interface SiteResumeActionsProps extends ComponentProps {}

/**
 * Renders the header's two direct affordances for the primary resume — viewing it and downloading
 * it — or nothing at all when no resume has been marked primary.
 *
 * The read is cached cross-request (see `get-primary-resume.ts`), which is what lets the header
 * render in the initial HTML flush instead of streaming in after a database round trip.
 */
export const SiteResumeActions = async (
  props: SiteResumeActionsProps,
): Promise<JSX.Element | null> => {
  const resume = await getPrimaryResume();
  if (resume === null) {
    return null;
  }
  return (
    <div
      {...props}
      className={classNames('flex flex-row items-center gap-[8px]', props.className)}
      id={SiteResumeActionsElementId}
    >
      <Button.Outlined element='a' href={resume.url} openInNewTab size='medium'>
        View Resume
      </Button.Outlined>
      <IconButton.Solid
        element='a'
        href={resume.downloadUrl}
        icon={{ name: 'cloud-arrow-down' }}
        openInNewTab
        radius='sm'
        scheme='secondary'
        size='medium'
      />
    </div>
  );
};
