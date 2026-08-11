import { AllSyndicationChannels, ContactIcon, type Profile } from './types';

/**
 * The person the resume is about.
 *
 * The prose around the profile block is modeled as rows rather than string arrays, so each
 * paragraph carries its own order and its own syndication decision — a shorter "about" on the
 * printed page than on the website costs nothing.
 */
export const NickFlorin: Profile = {
  about: [
    {
      channels: AllSyndicationChannels,
      content: `A detail-obsessed, ownership-driven, product-first engineer who goes well beyond
        closing tickets. Deeply invested in the <em>why</em> behind every feature, proactively
        identifying architectural gaps, raising engineering standards, and driving meaningful
        improvements across the product and the team, end-to-end, pushing the user experience
        forward at every turn.`,
      isVisible: true,
      order: 0,
      shortContent: null,
      slug: 'beyond-tickets',
    },
    {
      channels: AllSyndicationChannels,
      content: `Proactive by default: He proposes the fix before being asked, carries features from
        ambiguous scope to production polish.`,
      isVisible: true,
      order: 1,
      shortContent: null,
      slug: 'proactive-by-default',
    },
    {
      channels: AllSyndicationChannels,
      content: `Has a proven track record of leading cross-functional pods, delivering high-impact
        features, and elevating the engineering bar at every stage of a company's growth.`,
      isVisible: true,
      order: 2,
      shortContent: null,
      slug: 'track-record',
    },
  ],
  contacts: [
    {
      channels: AllSyndicationChannels,
      icon: ContactIcon.At,
      isVisible: true,
      order: 0,
      shortText: null,
      slug: 'email',
      text: 'nickmflorin@gmail.com',
    },
    {
      channels: AllSyndicationChannels,
      icon: ContactIcon.LinkedIn,
      isVisible: true,
      order: 1,
      shortText: null,
      slug: 'linkedin',
      text: 'in/nick-florin-5046063b/',
    },
    {
      channels: AllSyndicationChannels,
      icon: ContactIcon.GitHub,
      isVisible: true,
      order: 2,
      shortText: null,
      slug: 'github',
      text: 'github.com/nickmflorin',
    },
    {
      channels: AllSyndicationChannels,
      icon: ContactIcon.Globe,
      isVisible: true,
      order: 3,
      shortText: null,
      slug: 'website',
      text: 'www.nickflorin.com',
    },
  ],
  displayName: 'Nick Florin',
  emailAddress: 'nickmflorin@gmail.com',
  firstName: 'Nick',
  githubUrl: 'https://github.com/nickmflorin',
  handle: '@nickmflorin',
  highlights: [
    {
      channels: AllSyndicationChannels,
      isVisible: true,
      order: 0,
      shortText: null,
      slug: 'years-of-experience',
      text: '<strong>11 years</strong> of software engineering',
    },
    {
      channels: AllSyndicationChannels,
      isVisible: true,
      order: 1,
      shortText: null,
      slug: 'masters',
      text: '<strong>M.S. in Financial Mathematics</strong>, JHU',
    },
    {
      channels: AllSyndicationChannels,
      isVisible: true,
      order: 2,
      shortText: null,
      slug: 'bachelors',
      text: '<strong>B.S. in Electrical Engineering</strong>, RPI',
    },
  ],
  intro:
    'A passionate engineer that thrives on solving complex problems - the more complex the ' +
    'problem, the more I am drawn to it. I love to build things, and sometimes break them as well.',
  lastName: 'Florin',
  linkedinUrl: 'https://www.linkedin.com/in/nick-florin-5046063b/',
  middleName: 'Mark',
  phoneNumber: null,
  photoFileName: 'Headshot.jpeg',
  profileImageUrl: null,
  slug: 'nick-florin',
  tagline: 'Senior Software Engineer',
};
