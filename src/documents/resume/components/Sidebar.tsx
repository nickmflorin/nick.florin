import { Fragment } from 'react';

import { NickFlorin } from '../data/profile';
import { type ResumeCompetenciesGroup, ResumeCompetenciesGroupDisplay } from '../data/types';
import { icon, logo } from '../lib/assets';

import { CompetencyBar } from './CompetencyBar';
import { Pills } from './Pills';

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

/**
 * The icon file each contact entry renders, keyed by the enum rather than by a stored filename so
 * that the icon set is closed and a typo cannot silently render a missing image.
 */
const ContactIcons: Record<string, string> = {
  AT: 'At',
  GITHUB: 'GitHub',
  GLOBE: 'Globe',
  LINKEDIN: 'LinkedIn',
};

export interface SidebarProps {
  readonly competencyGroups: readonly ResumeCompetenciesGroup[];
  /**
   * Whether the about, highlights and contact blocks render. True on the opening sheet only.
   */
  readonly isIntroVisible: boolean;
}

export const Sidebar = ({ competencyGroups, isIntroVisible }: SidebarProps) => (
  <aside className='sidebar'>
    <div className='profile'>
      {NickFlorin.photoFileName === null ? null : (
        <img
          alt={NickFlorin.displayName}
          className='profile-photo'
          src={logo(NickFlorin.photoFileName)}
        />
      )}
      <div className='profile-name'>{NickFlorin.displayName}</div>
      <div className='profile-role'>{NickFlorin.tagline}</div>
      <div className='profile-handle'>{NickFlorin.handle}</div>
    </div>
    {isIntroVisible ? (
      <>
        <p className='s-heading'>About</p>
        {NickFlorin.about.map(paragraph => (
          <p
            className='about'
            dangerouslySetInnerHTML={{ __html: collapse(paragraph.content) }}
            key={paragraph.slug}
          />
        ))}
        <ul className='bullets'>
          {NickFlorin.highlights.map(highlight => (
            <li key={highlight.slug}>
              <span className='dot'>
                <img alt='' src={icon('Plus')} />
              </span>
              {highlight.text}
            </li>
          ))}
        </ul>
        <hr className='sdiv' />
        <p className='s-heading'>Contact</p>
        <ul className='contact-list'>
          {NickFlorin.contacts.map(entry => (
            <li key={entry.slug}>
              <span className='ci'>
                <img alt='' src={icon(ContactIcons[entry.icon])} />
              </span>
              {entry.text}
            </li>
          ))}
        </ul>
      </>
    ) : null}
    {competencyGroups.map(group => (
      <Fragment key={group.slug}>
        <p className='s-heading'>{group.heading}</p>
        {group.display === ResumeCompetenciesGroupDisplay.Bars ? (
          group.competencies.map(competency => (
            <CompetencyBar competency={competency} key={competency.slug} />
          ))
        ) : (
          <Pills competencies={group.competencies} where='sidebar' />
        )}
      </Fragment>
    ))}
  </aside>
);
