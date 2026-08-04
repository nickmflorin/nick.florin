import {
  AiToolingAndAutomation,
  ArchitecturalPatterns,
  CicdAndAutomation,
  CloudAndDatabases,
  CodeQualityAndDx,
  KeyStrengths,
  LanguagesAndFrameworks,
  MonorepoAndBuild,
  Testing,
  TopSkills,
  UiAndComponentLibraries,
} from './competency-groups';
import { degreesBySlug } from './degrees';
import { rolesBySlug } from './roles';
import { type ResumeSheetInput } from './types';

/**
 * THE PAGE LAYOUT. Page breaks are assigned here by hand, not flowed by CSS: each sheet is a
 * standalone 8.5x11 document, which is what guarantees a role is never split across a page
 * boundary in the PDF.
 *
 * A sheet names the roles and degrees it carries and nothing else about them. Their order within
 * the sheet is derived from their start dates, and the header drawn above each run is derived from
 * whether the run is roles or degrees, so neither can drift from the underlying records.
 *
 * Adding content therefore means rebalancing sheets by hand. The stacked browsing view
 * (`/documents/resume`) renders every sheet with a visible boundary so overflow is obvious;
 * content that runs past the bottom edge of a sheet is clipped rather than pushed onto a new page.
 */
export const Sheets: ResumeSheetInput[] = [
  {
    competencyGroups: [LanguagesAndFrameworks, TopSkills, KeyStrengths],
    degrees: [],
    isIntroVisible: true,
    order: 0,
    roles: rolesBySlug(['craft']),
    slug: 'page-1',
  },
  {
    competencyGroups: [
      AiToolingAndAutomation,
      CloudAndDatabases,
      ArchitecturalPatterns,
      UiAndComponentLibraries,
      Testing,
      MonorepoAndBuild,
      CicdAndAutomation,
    ],
    degrees: [],
    isIntroVisible: false,
    order: 1,
    roles: rolesBySlug(['northbeam', 'shelfcycle', 'corsha', 'greenbudget', 'nirveda', 'saracen']),
    slug: 'page-2',
  },
  {
    /* The build and tooling groups live here rather than on page 2: they read as one family
       (build -> quality -> automation), and page 2's sidebar is the tightest of the three while
       this one has the most room. */
    competencyGroups: [CodeQualityAndDx],
    degrees: degreesBySlug(['jhu-computational', 'jhu-financial', 'rpi']),
    isIntroVisible: false,
    order: 2,
    roles: rolesBySlug(['atlantic', 'rockcreek', 'pianalytics']),
    slug: 'page-3',
  },
];
