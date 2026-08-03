import { Fragment } from 'react';

import { ABOUT, CONTACT, HIGHLIGHTS, PROFILE } from '../data/profile';
import { type SidebarSection } from '../data/types';
import { icon, logo } from '../lib/assets';

import { Pills } from './Pills';
import { SkillBar } from './SkillBar';

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

export interface SidebarProps {
  /**
   * Whether the about/highlights/contact block renders. True on the opening sheet only.
   */
  readonly isIntroVisible: boolean;
  readonly sections: readonly SidebarSection[];
}

export const Sidebar = ({ isIntroVisible, sections }: SidebarProps) => (
  <aside className='sidebar'>
    <div className='profile'>
      <img alt={PROFILE.name} className='profile-photo' src={logo(PROFILE.photo)} />
      <div className='profile-name'>{PROFILE.name}</div>
      <div className='profile-role'>{PROFILE.title}</div>
      <div className='profile-handle'>{PROFILE.handle}</div>
    </div>
    {isIntroVisible && (
      <>
        <p className='s-heading'>About</p>
        {ABOUT.map(paragraph => (
          <p
            className='about'
            dangerouslySetInnerHTML={{ __html: collapse(paragraph) }}
            key={paragraph}
          />
        ))}
        <ul className='bullets'>
          {HIGHLIGHTS.map(highlight => (
            <li key={highlight}>
              <span className='dot'>
                <img alt='' src={icon('Plus')} />
              </span>
              {highlight}
            </li>
          ))}
        </ul>
        <hr className='sdiv' />
        <p className='s-heading'>Contact</p>
        <ul className='contact-list'>
          {CONTACT.map(entry => (
            <li key={entry.text}>
              <span className='ci'>
                <img alt='' src={icon(entry.icon)} />
              </span>
              {entry.text}
            </li>
          ))}
        </ul>
      </>
    )}
    {sections.map((section, index) => (
      <Fragment key={section.heading}>
        {(isIntroVisible || index > 0) && <hr className='sdiv' />}
        <p className='s-heading'>{section.heading}</p>
        {section.kind === 'bars' ? (
          section.bars.map(bar => <SkillBar key={bar.name} level={bar.level} name={bar.name} />)
        ) : (
          <Pills pills={section.pills} where='sidebar' />
        )}
      </Fragment>
    ))}
  </aside>
);
