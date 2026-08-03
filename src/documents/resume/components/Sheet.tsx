import { Fragment } from 'react';

import { degreesByKey } from '../data/education';
import { rolesByKey } from '../data/experience';
import { type Sheet as ResumeSheet } from '../data/types';

import { DevHeader } from './DevHeader';
import { Education } from './Education';
import { Role } from './Role';
import { Sidebar } from './Sidebar';

export interface SheetProps {
  readonly sheet: ResumeSheet;
}

/**
 * One physical 8.5x11 sheet: the sidebar, then the main column's blocks in order. A sheet is
 * fixed-size and clips its overflow, so content that does not fit is visibly cut off rather than
 * silently reflowed onto another page.
 */
export const Sheet = ({ sheet }: SheetProps) => (
  <div className='page'>
    <Sidebar isIntroVisible={sheet.isIntroVisible} sections={sheet.sections} />
    <main className='main'>
      {sheet.main.map((block, index) => (
        <Fragment key={block.file}>
          <DevHeader file={block.file} isSpaced={index > 0} />
          {block.kind === 'roles'
            ? rolesByKey(block.roles).map(role => <Role key={role.key} role={role} />)
            : degreesByKey(block.degrees).map(degree => (
                <Education degree={degree} key={degree.key} />
              ))}
        </Fragment>
      ))}
    </main>
  </div>
);
