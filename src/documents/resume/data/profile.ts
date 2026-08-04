import { ContactIcon, type Profile } from './types';

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
      content: `A detail-obsessed, ownership-driven, product-first engineer who goes well beyond
        closing tickets. Deeply invested in the <em>why</em> behind every feature, proactively
        identifying architectural gaps, raising engineering standards, and driving meaningful
        improvements across the product and the team, end-to-end, pushing the user experience
        forward at every turn.`,
      excludedChannels: [],
      isVisible: true,
      order: 0,
      shortContent: null,
      slug: 'beyond-tickets',
    },
    {
      content: `Proactive by default: He proposes the fix before being asked, carries features from
        ambiguous scope to production polish.`,
      excludedChannels: [],
      isVisible: true,
      order: 1,
      shortContent: null,
      slug: 'proactive-by-default',
    },
    {
      content: `Has a proven track record of leading cross-functional pods, delivering high-impact
        features, and elevating the engineering bar at every stage of a company's growth.`,
      excludedChannels: [],
      isVisible: true,
      order: 2,
      shortContent: null,
      slug: 'track-record',
    },
  ],
  contacts: [
    {
      excludedChannels: [],
      icon: ContactIcon.At,
      isVisible: true,
      order: 0,
      shortText: null,
      slug: 'email',
      text: 'nickmflorin@gmail.com',
    },
    {
      excludedChannels: [],
      icon: ContactIcon.LinkedIn,
      isVisible: true,
      order: 1,
      shortText: null,
      slug: 'linkedin',
      text: 'in/nick-florin-5046063b/',
    },
    {
      excludedChannels: [],
      icon: ContactIcon.GitHub,
      isVisible: true,
      order: 2,
      shortText: null,
      slug: 'github',
      text: 'github.com/nickmflorin',
    },
    {
      excludedChannels: [],
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
      excludedChannels: [],
      isVisible: true,
      order: 0,
      shortText: null,
      slug: 'years-of-experience',
      text: '11 years of software engineering',
    },
    {
      excludedChannels: [],
      isVisible: true,
      order: 1,
      shortText: null,
      slug: 'masters',
      text: 'M.S. in Financial Mathematics, JHU',
    },
    {
      excludedChannels: [],
      isVisible: true,
      order: 2,
      shortText: null,
      slug: 'bachelors',
      text: 'B.S. in Electrical Engineering, RPI',
    },
  ],
  intro: null,
  lastName: 'Florin',
  linkedinUrl: 'https://www.linkedin.com/in/nick-florin-5046063b/',
  middleName: null,
  phoneNumber: null,
  photoFileName: 'Headshot.jpeg',
  profileImageUrl: null,
  slug: 'nick-florin',
  tagline: 'Senior Software Engineer',
};
