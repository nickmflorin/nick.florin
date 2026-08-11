/**
 * Emits the YAML fixture files in `src/documents/resume/fixtures/` from the TypeScript data
 * modules in `src/documents/resume/data/`.
 *
 * While the Prisma models and the fixture ⇄ database sync tooling are pending, the TypeScript data
 * modules remain the operative source of resume content, and the YAML fixtures are the parallel
 * definition the new data-management flow is built against. Running this script is how the two are
 * kept in parity: edit the data modules, regenerate, and commit both.
 *
 * The fixtures are written in the AUTHORING shape: `order` is implied by array position, relations
 * are slug references, and fields carrying their default value (`null`, `false` flags, `isVisible:
 * true`, empty arrays) are omitted entirely. See the fixture-format decision in
 * `docs/projects/resume-generation/decisions.md`.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { stringify } from 'yaml';

import * as CompanyRecords from '~/documents/resume/data/companies';
import * as CompetencyRecords from '~/documents/resume/data/competencies';
import { Courses } from '~/documents/resume/data/courses';
import { Degrees } from '~/documents/resume/data/degrees';
import { Sheets } from '~/documents/resume/data/pages';
import { NickFlorin } from '~/documents/resume/data/profile';
import { Projects } from '~/documents/resume/data/projects';
import { Repositories } from '~/documents/resume/data/repositories';
import { Roles } from '~/documents/resume/data/roles';
import * as SchoolRecords from '~/documents/resume/data/schools';
import {
  type Company,
  type Competency,
  type ContentInput,
  type Course,
  type DegreeInput,
  type NestedNodeInput,
  type NodeInput,
  type Profile,
  type Project,
  type Repository,
  type ResumeSheetInput,
  type RoleInput,
  type School,
  type SyndicationChannel,
} from '~/documents/resume/data/types';

const FixturesDir = path.join(process.cwd(), 'src', 'documents', 'resume', 'fixtures');

type YamlRecord = Record<string, unknown>;

const compact = (record: YamlRecord): YamlRecord =>
  Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

const orNothing = <T>(value: null | T): T | undefined => value ?? undefined;

/**
 * Elides a boolean whose default is `false`, so that only affirmative flags are authored.
 */
const flag = (value: boolean | undefined): true | undefined => (value === true ? true : undefined);

/**
 * Elides `isVisible`, whose default is `true` — only an explicit `false` is worth authoring.
 */
const visibility = (value: boolean | undefined): false | undefined =>
  value === false ? false : undefined;

const channelList = (
  value: readonly SyndicationChannel[] | undefined,
): SyndicationChannel[] | undefined =>
  value !== undefined && value.length > 0 ? [...value] : undefined;

const competencySlugs = (value: readonly Competency[] | undefined): string[] | undefined =>
  value !== undefined && value.length > 0 ? value.map(competency => competency.slug) : undefined;

const isoDate = (value: Date | null): string | undefined =>
  value === null ? undefined : value.toISOString().slice(0, 10);

const prose = (value: string | undefined): string | undefined =>
  value === undefined ? undefined : collapse(value);

const emitNestedNode = (node: NestedNodeInput): YamlRecord =>
  compact({
    channels: channelList(node.channels),
    competencies: competencySlugs(node.competencies),
    content: prose(node.content),
    isVisible: visibility(node.isVisible),
    title: prose(node.title),
    titleLayout: node.titleLayout,
  });

const emitNode = (node: NodeInput): YamlRecord =>
  compact({
    channels: channelList(node.channels),
    children:
      node.children !== undefined && node.children.length > 0
        ? node.children.map(emitNestedNode)
        : undefined,
    competencies: competencySlugs(node.competencies),
    content: prose(node.content),
    isVisible: visibility(node.isVisible),
    title: prose(node.title),
    titleLayout: node.titleLayout,
    type: node.type,
  });

const emitContent = (content: ContentInput): YamlRecord =>
  compact({
    channels: channelList(content.channels),
    competencies: competencySlugs(content.competencies),
    content: content.content?.map(emitNode),
    isVisible: visibility(content.isVisible),
    summary: content.summary?.map(emitNode),
  });

const emitCompetency = (competency: Competency): YamlRecord =>
  compact({
    calculatedExperience: orNothing(competency.calculatedExperience),
    channels: channelList(competency.channels),
    description: orNothing(competency.description),
    experience: orNothing(competency.experience),
    isHighlighted: flag(competency.isHighlighted),
    isPrioritized: flag(competency.isPrioritized),
    isVisible: visibility(competency.isVisible),
    label: competency.label,
    proficiency: orNothing(competency.proficiency),
    shortDescription: orNothing(competency.shortDescription),
    shortLabel: orNothing(competency.shortLabel),
    slug: competency.slug,
  });

const emitCompany = (company: Company): YamlRecord =>
  compact({
    city: orNothing(company.city),
    description: orNothing(company.description),
    logoFileName: orNothing(company.logoFileName),
    logoImageUrl: orNothing(company.logoImageUrl),
    name: company.name,
    shortName: orNothing(company.shortName),
    slug: company.slug,
    state: orNothing(company.state),
    websiteUrl: orNothing(company.websiteUrl),
  });

const emitSchool = (school: School): YamlRecord =>
  compact({
    city: school.city,
    description: orNothing(school.description),
    logoFileName: orNothing(school.logoFileName),
    logoImageUrl: orNothing(school.logoImageUrl),
    name: school.name,
    shortName: orNothing(school.shortName),
    slug: school.slug,
    state: school.state,
    websiteUrl: orNothing(school.websiteUrl),
  });

const emitRole = (role: RoleInput): YamlRecord =>
  compact({
    city: orNothing(role.city),
    company: role.company.slug,
    content: emitContent(role.content),
    endDate: isoDate(role.endDate),
    isCurrent: flag(role.isCurrent),
    isHighlighted: flag(role.isHighlighted),
    isRemote: flag(role.isRemote),
    shortTitle: orNothing(role.shortTitle),
    slug: role.slug,
    startDate: isoDate(role.startDate),
    state: orNothing(role.state),
    title: role.title,
  });

const emitDegree = (degree: DegreeInput): YamlRecord =>
  compact({
    concentration: orNothing(degree.concentration),
    content: emitContent(degree.content),
    degree: degree.degree,
    endDate: isoDate(degree.endDate),
    gpa: orNothing(degree.gpa),
    isCurrent: flag(degree.isCurrent),
    isHighlighted: flag(degree.isHighlighted),
    isPostponed: flag(degree.isPostponed),
    major: degree.major,
    minor: orNothing(degree.minor),
    note: orNothing(degree.note),
    school: degree.school.slug,
    shortConcentration: orNothing(degree.shortConcentration),
    shortMajor: orNothing(degree.shortMajor),
    shortMinor: orNothing(degree.shortMinor),
    shortNote: orNothing(degree.shortNote),
    slug: degree.slug,
    startDate: isoDate(degree.startDate),
  });

const emitProfile = (profile: Profile): YamlRecord =>
  compact({
    about: profile.about.map(paragraph =>
      compact({
        channels: channelList(paragraph.channels),
        content: collapse(paragraph.content),
        isVisible: visibility(paragraph.isVisible),
        shortContent: orNothing(paragraph.shortContent),
        slug: paragraph.slug,
      }),
    ),
    contacts: profile.contacts.map(entry =>
      compact({
        channels: channelList(entry.channels),
        icon: entry.icon,
        isVisible: visibility(entry.isVisible),
        shortText: orNothing(entry.shortText),
        slug: entry.slug,
        text: entry.text,
      }),
    ),
    displayName: profile.displayName,
    emailAddress: profile.emailAddress,
    firstName: profile.firstName,
    githubUrl: orNothing(profile.githubUrl),
    handle: orNothing(profile.handle),
    highlights: profile.highlights.map(highlight =>
      compact({
        channels: channelList(highlight.channels),
        isVisible: visibility(highlight.isVisible),
        shortText: orNothing(highlight.shortText),
        slug: highlight.slug,
        text: highlight.text,
      }),
    ),
    intro: orNothing(profile.intro),
    lastName: profile.lastName,
    linkedinUrl: orNothing(profile.linkedinUrl),
    middleName: orNothing(profile.middleName),
    phoneNumber: orNothing(profile.phoneNumber),
    photoFileName: orNothing(profile.photoFileName),
    profileImageUrl: orNothing(profile.profileImageUrl),
    slug: profile.slug,
    tagline: orNothing(profile.tagline),
  });

const emitSheet = (sheet: ResumeSheetInput): YamlRecord =>
  compact({
    competencyGroups: sheet.competencyGroups.map(group =>
      compact({
        competencies: group.competencies.map(competency => competency.slug),
        display: group.display,
        heading: group.heading,
        shortHeading: orNothing(group.shortHeading),
        slug: group.slug,
      }),
    ),
    degrees: sheet.degrees.length > 0 ? sheet.degrees.map(degree => degree.slug) : undefined,
    isIntroVisible: flag(sheet.isIntroVisible),
    roles: sheet.roles.length > 0 ? sheet.roles.map(role => role.slug) : undefined,
    slug: sheet.slug,
  });

const emitRepository = (repository: Repository): YamlRecord =>
  compact({
    channels: channelList(repository.channels),
    competencies: competencySlugs(repository.competencies),
    description: orNothing(repository.description),
    highlighted: flag(repository.highlighted),
    npmPackageName: orNothing(repository.npmPackageName),
    slug: repository.slug,
    startDate: isoDate(repository.startDate),
    /* The legacy default is hidden, so only an affirmative `visible` is authored. */
    visible: flag(repository.visible),
  });

const emitProject = (project: Project): YamlRecord =>
  compact({
    channels: channelList(project.channels),
    competencies: competencySlugs(project.competencies),
    description: project.description,
    highlighted: flag(project.highlighted),
    name: project.name,
    repositories: project.repositories.map(repository => repository.slug),
    shortName: orNothing(project.shortName),
    slug: project.slug,
    startDate: isoDate(project.startDate),
    visible: flag(project.visible),
  });

const emitCourse = (course: Course): YamlRecord =>
  compact({
    channels: channelList(course.channels),
    competencies: competencySlugs(course.competencies),
    degree: course.degree,
    description: orNothing(course.description),
    name: course.name,
    shortName: orNothing(course.shortName),
    slug: course.slug,
    visible: visibility(course.visible),
  });

const writeFixture = async (filename: string, key: string, value: unknown): Promise<void> => {
  const document = stringify({ [key]: value }, { lineWidth: 100 });
  await fs.writeFile(path.join(FixturesDir, filename), document, 'utf-8');
};

const bySlug = <T extends { readonly slug: string }>(records: T[]): T[] =>
  records.sort((a, b) => a.slug.localeCompare(b.slug));

const main = async (): Promise<void> => {
  const competencies: Competency[] = bySlug(Object.values(CompetencyRecords));
  const companies: Company[] = bySlug(Object.values(CompanyRecords));
  const schools: School[] = bySlug(Object.values(SchoolRecords));

  await fs.mkdir(FixturesDir, { recursive: true });
  await writeFixture('competencies.yaml', 'competencies', competencies.map(emitCompetency));
  await writeFixture('companies.yaml', 'companies', companies.map(emitCompany));
  await writeFixture('schools.yaml', 'schools', schools.map(emitSchool));
  await writeFixture('profile.yaml', 'profile', emitProfile(NickFlorin));
  await writeFixture('roles.yaml', 'roles', Roles.map(emitRole));
  await writeFixture('degrees.yaml', 'degrees', Degrees.map(emitDegree));
  await writeFixture('resume-sheets.yaml', 'sheets', Sheets.map(emitSheet));
  await writeFixture(
    'repositories.yaml',
    'repositories',
    bySlug([...Repositories]).map(emitRepository),
  );
  await writeFixture('projects.yaml', 'projects', bySlug([...Projects]).map(emitProject));
  await writeFixture('courses.yaml', 'courses', bySlug([...Courses]).map(emitCourse));

  /* eslint-disable-next-line no-console -- Standalone CLI tooling; the logger is not in context. */
  console.info(
    `Emitted ${Roles.length} roles, ${Degrees.length} degrees, ` +
      `${competencies.length} competencies, ${companies.length} companies, ${schools.length} ` +
      `schools, ${Sheets.length} sheets, ${Repositories.length} repositories, ` +
      `${Projects.length} projects, ${Courses.length} courses and the profile to ` +
      `'${FixturesDir}'.`,
  );
};

void main();
