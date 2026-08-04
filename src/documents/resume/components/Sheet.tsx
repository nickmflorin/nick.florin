import { ContentOwnerType, type ResumeSheetInput, SyndicationChannel } from '../data/types';
import { resolveContent } from '../lib/normalize';

import { DevHeader } from './DevHeader';
import { Education } from './Education';
import { Role } from './Role';
import { Sidebar } from './Sidebar';

export interface SheetProps {
  readonly sheet: ResumeSheetInput;
}

/**
 * Newest first, which is the only order the printed resume ever uses. Derived rather than stored,
 * so a sheet cannot disagree with the dates on the records it carries.
 */
const byStartDateDescending = <T extends { readonly startDate: Date }>(a: T, b: T): number =>
  b.startDate.getTime() - a.startDate.getTime();

/**
 * One physical 8.5x11 sheet: the sidebar, then the main column. A sheet is fixed-size and clips its
 * overflow, so content that does not fit is visibly cut off rather than silently reflowed onto
 * another page.
 *
 * The main column is a plain element rather than a `main` landmark because a document may contain
 * several sheets. The landmark is declared once, by whichever top-level component owns the
 * document.
 *
 * Resolution happens here because this is the first component that knows which channel is being
 * rendered. The header above each run is derived from whether the run is roles or degrees, so it
 * can never name a file the run does not come from.
 */
export const Sheet = ({ sheet }: SheetProps) => {
  const roles = resolveContent(
    [...sheet.roles].sort(byStartDateDescending),
    ContentOwnerType.Role,
    SyndicationChannel.Resume,
  );
  const degrees = resolveContent(
    [...sheet.degrees].sort(byStartDateDescending),
    ContentOwnerType.Degree,
    SyndicationChannel.Resume,
  );
  return (
    <div className='page'>
      <Sidebar competencyGroups={sheet.competencyGroups} isIntroVisible={sheet.isIntroVisible} />
      <div className='main'>
        {roles.length === 0 ? null : (
          <>
            <DevHeader file='experience.ts' />
            {roles.map(role => (
              <Role key={role.slug} role={role} />
            ))}
          </>
        )}
        {degrees.length === 0 ? null : (
          <>
            <DevHeader file='education.ts' isSpaced={roles.length !== 0} />
            {degrees.map(degree => (
              <Education degree={degree} key={degree.slug} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
