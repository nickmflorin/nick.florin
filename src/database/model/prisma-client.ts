/* The sole module allowed to reach into the generated Prisma client - everything else imports the
   client's types and enums from here.

   The generator emits a 'package.json' into 'generated' whose "name" is a content hash of the
   schema ('prisma-client-<sha>').  That file makes the directory look like a package boundary to
   'import/no-relative-packages', whose autofix rewrites './generated' to that hashed name - a
   specifier that resolves nowhere, and that changes every time the schema does.  The generated
   client is an artifact of this directory rather than a package, so the relative import is the
   correct one, and confining it to this module keeps the rule enabled everywhere it is meaningful.

   Prisma 5 also emits a CommonJS client, and Turbopack cannot statically analyze 'export *' against
   one.  Doing so still works, but it emits a warning on every compile - three times over, once per
   environment - and forces Turbopack to fall back to resolving the re-exports at runtime.

   Types are erased at build time, so only the runtime values need to be listed explicitly.  If the
   Prisma schema gains a new enum, it has to be added below; leaving it out is a compile error
   wherever it is used, not a runtime failure.

   The enums below are exported by the type-only star re-export as well, since an enum is both a
   type and a value.  An explicit named export takes precedence over a star re-export of the same
   name, so the two forms compose rather than collide - but 'import/export' cannot see that and
   reports each name twice. */
/* eslint-disable import/no-relative-packages, import/export -- See above. */
export type * from './generated';
export {
  $Enums,
  ContactIcon,
  ContentOwnerType,
  DegreeType,
  DetailEntityType,
  NodeKind,
  NodeType,
  Prisma,
  PrismaClient,
  Proficiency,
  ProgrammingDomain,
  ProgrammingLanguage,
  ResumeCompetenciesGroupDisplay,
  SkillCategory,
  SyndicationChannel,
  TitleLayout,
} from './generated';
