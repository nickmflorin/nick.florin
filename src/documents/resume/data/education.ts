import { resolveContent } from '../lib/normalize';

import { ContentOwnerType, type Degree, type ResolvedDegree, SyndicationChannel } from './types';

/**
 * Every degree. A degree's prose is one summary node — the same content tree a role has, used at
 * its simplest — so a line can be withheld from a channel exactly the way a role's can.
 */
export const DEGREES: Degree[] = [
  {
    content: {
      summary: [
        { content: 'Ongoing coursework toward an additional degree, temporarily postponed.' },
      ],
    },
    dates: 'Jan 2016 - Postponed',
    degree: 'M.S. in Computational Mathematics',
    gpa: 'GPA 3.70 / 4.00',
    key: 'jhu-computational',
    location: 'Baltimore, MD',
    logo: 'JHU.svg',
    school: 'The Johns Hopkins University',
  },
  {
    content: {
      summary: [
        {
          content:
            'Advanced coursework in Applied Mathematics, Statistics &amp; Numerical Computation.',
        },
      ],
    },
    dates: 'Aug 2014 - Jan 2016',
    degree: 'M.S. in Engineering; Financial Mathematics',
    gpa: 'GPA 3.85 / 4.00',
    key: 'jhu-financial',
    location: 'Baltimore, MD',
    logo: 'JHU.svg',
    school: 'The Johns Hopkins University',
  },
  {
    content: {
      summary: [
        { content: 'Minor in Economics; Concentration in Robotics &amp; Control Systems.' },
      ],
    },
    dates: 'Aug 2010 - May 2014',
    degree: 'B.S. in Electrical Engineering',
    gpa: 'GPA 3.50 / 4.00',
    key: 'rpi',
    location: 'Troy, NY',
    logo: 'RPI.svg',
    school: 'Rensselaer Polytechnic Institute',
  },
];

const BY_KEY = new Map(DEGREES.map(degree => [degree.key, degree]));

/**
 * Look up degrees by key, in the order given, failing loudly on a typo in `pages.ts`, and hand back
 * their content already normalized and resolved for the resume.
 */
export function degreesByKey(keys: string[]): ResolvedDegree[] {
  const degrees = keys.map(key => {
    const degree = BY_KEY.get(key);
    if (!degree) {
      throw new Error(`No degree with key '${key}'. Known keys: ${[...BY_KEY.keys()].join(', ')}.`);
    }
    return degree;
  });
  return resolveContent(degrees, ContentOwnerType.Education, SyndicationChannel.Resume);
}
