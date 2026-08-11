import {
  CPlusPlus,
  DataVisualization,
  Django,
  Matlab,
  NumericalComputation,
  Numpy,
  OptimizationMethods,
  Pandas,
  Python,
  R,
  ScikitLearn,
  Scipy,
} from './competencies';
import { RensselaerPolytechnicInstitute, TheJohnsHopkinsUniversity } from './schools';
import { AllSyndicationChannels, type DegreeInput, DegreeType } from './types';

/**
 * Every degree. A degree's prose is one summary node — the same content tree a role has, used at
 * its simplest — so a line can be withheld from a channel exactly the way a role's can.
 */
export const Degrees: DegreeInput[] = [
  {
    concentration: null,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        Django,
        NumericalComputation,
        Python,
        Pandas,
        DataVisualization,
        Matlab,
        OptimizationMethods,
        Scipy,
        Numpy,
        ScikitLearn,
      ],
      summary: [
        { content: 'Ongoing coursework toward an additional degree, temporarily postponed.' },
      ],
    },
    degree: DegreeType.MastersOfScience,
    endDate: null,
    gpa: '3.70 / 4.00',
    isCurrent: false,
    isHighlighted: true,
    isPostponed: true,
    major: 'Computational Mathematics',
    minor: null,
    note:
      'Ongoing coursework temporarily postponed after completing approximately 50% of ' +
      'coursework.',
    school: TheJohnsHopkinsUniversity,
    shortConcentration: null,
    shortMajor: null,
    shortMinor: null,
    shortNote: null,
    slug: 'jhu-computational',
    startDate: new Date('2016-01-01'),
  },
  {
    concentration: null,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        Django,
        NumericalComputation,
        Python,
        Pandas,
        DataVisualization,
        Matlab,
        OptimizationMethods,
        R,
        Scipy,
        Numpy,
        ScikitLearn,
      ],
      summary: [
        {
          content:
            'Advanced coursework in Applied Mathematics, Statistics &amp; Numerical Computation.',
        },
      ],
    },
    degree: DegreeType.MastersOfScienceInEngineering,
    endDate: new Date('2016-01-01'),
    gpa: '3.85 / 4.00',
    isCurrent: false,
    isHighlighted: true,
    isPostponed: false,
    major: 'Financial Mathematics',
    minor: null,
    note: null,
    school: TheJohnsHopkinsUniversity,
    shortConcentration: null,
    shortMajor: null,
    shortMinor: null,
    shortNote: null,
    slug: 'jhu-financial',
    startDate: new Date('2014-08-01'),
  },
  {
    concentration: 'Robotics & Control Systems',
    content: {
      channels: AllSyndicationChannels,
      competencies: [NumericalComputation, Python, CPlusPlus, Matlab],
      summary: [
        { content: 'Minor in Economics; Concentration in Robotics &amp; Control Systems.' },
      ],
    },
    degree: DegreeType.BachelorsOfScience,
    endDate: new Date('2014-05-01'),
    gpa: '3.50 / 4.00',
    isCurrent: false,
    isHighlighted: true,
    isPostponed: false,
    major: 'Electrical Engineering',
    minor: 'Economics',
    note: null,
    school: RensselaerPolytechnicInstitute,
    shortConcentration: null,
    shortMajor: null,
    shortMinor: null,
    shortNote: null,
    slug: 'rpi',
    startDate: new Date('2010-08-01'),
  },
];

const BySlug = new Map(Degrees.map(degree => [degree.slug, degree]));

/**
 * Look up degrees by slug, in the order given, failing loudly on a typo.
 *
 * Returns the AUTHORED records rather than resolved ones: the syndication channel is not known
 * here, so resolution happens in the renderer that knows it.
 */
export function degreesBySlug(slugs: string[]): DegreeInput[] {
  return slugs.map(slug => {
    const degree = BySlug.get(slug);
    if (!degree) {
      throw new Error(
        `No degree with slug '${slug}'. Known slugs: ${[...BySlug.keys()].join(', ')}.`,
      );
    }
    return degree;
  });
}
