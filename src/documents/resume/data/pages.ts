import {
  AI_TOOLING_AND_AUTOMATION,
  ARCHITECTURAL_PATTERNS,
  CICD_AND_AUTOMATION,
  CLOUD_AND_DATABASES,
  CODE_QUALITY_AND_DX,
  KEY_STRENGTHS,
  LANGUAGES_AND_FRAMEWORKS,
  MONOREPO_AND_BUILD,
  TESTING,
  TOP_SKILLS,
  UI_AND_COMPONENT_LIBRARIES,
} from './skills';
import { type Sheet } from './types';

/**
 * THE PAGE LAYOUT. Page breaks are assigned here by hand, not flowed by CSS: each sheet is a
 * standalone 8.5x11 document, which is what guarantees a role is never split across a page
 * boundary in the PDF.
 *
 * Adding content therefore means rebalancing sheets by hand. The stacked browsing view
 * (`/documents/resume`) renders every sheet with a visible boundary so overflow is obvious;
 * content that runs past the bottom edge of a sheet is clipped rather than pushed onto a new
 * page.
 */
export const SHEETS: Sheet[] = [
  {
    id: 'page-1',
    isIntroVisible: true,
    main: [{ file: 'experience.ts', kind: 'roles', roles: ['craft'] }],
    sections: [LANGUAGES_AND_FRAMEWORKS, TOP_SKILLS, KEY_STRENGTHS],
  },
  {
    id: 'page-2',
    isIntroVisible: false,
    main: [
      {
        file: 'experience.ts',
        kind: 'roles',
        roles: ['northbeam', 'shelfcycle', 'corsha', 'greenbudget', 'nirveda', 'saracen'],
      },
    ],
    sections: [
      AI_TOOLING_AND_AUTOMATION,
      CLOUD_AND_DATABASES,
      ARCHITECTURAL_PATTERNS,
      UI_AND_COMPONENT_LIBRARIES,
      TESTING,
      MONOREPO_AND_BUILD,
      CICD_AND_AUTOMATION,
    ],
  },
  {
    id: 'page-3',
    isIntroVisible: false,
    main: [
      {
        file: 'experience.ts',
        kind: 'roles',
        roles: ['atlantic', 'rockcreek', 'pianalytics'],
      },
      {
        degrees: ['jhu-computational', 'jhu-financial', 'rpi'],
        file: 'education.ts',
        kind: 'education',
      },
    ],
    /* The build/tooling groups live here rather than on page 2: they read as one family
       (build -> quality -> automation), and page 2's sidebar is the tightest of the three while
       this one has the most room. */
    sections: [CODE_QUALITY_AND_DX],
  },
];
