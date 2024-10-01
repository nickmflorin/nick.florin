
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  detectRuntime,
} = require('./runtime/index-browser')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.8.0
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.8.0",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  clerkId: 'clerkId',
  firstName: 'firstName',
  lastName: 'lastName',
  profileImageUrl: 'profileImageUrl',
  emailAddress: 'emailAddress',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NestedDetailScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  label: 'label',
  description: 'description',
  shortDescription: 'shortDescription',
  visible: 'visible',
  detailId: 'detailId',
  projectId: 'projectId'
};

exports.Prisma.DetailScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  entityId: 'entityId',
  entityType: 'entityType',
  label: 'label',
  description: 'description',
  shortDescription: 'shortDescription',
  visible: 'visible',
  projectId: 'projectId'
};

exports.Prisma.ResumeScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  primary: 'primary',
  downloadUrl: 'downloadUrl',
  url: 'url',
  pathname: 'pathname',
  filename: 'filename',
  size: 'size'
};

exports.Prisma.RepositoryScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  description: 'description',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  visible: 'visible',
  highlighted: 'highlighted',
  startDate: 'startDate',
  npmPackageName: 'npmPackageName'
};

exports.Prisma.SkillScalarFieldEnum = {
  id: 'id',
  label: 'label',
  slug: 'slug',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  visible: 'visible',
  description: 'description',
  categories: 'categories',
  programmingLanguages: 'programmingLanguages',
  programmingDomains: 'programmingDomains',
  experience: 'experience',
  calculatedExperience: 'calculatedExperience',
  highlighted: 'highlighted',
  prioritized: 'prioritized'
};

exports.Prisma.CourseScalarFieldEnum = {
  id: 'id',
  name: 'name',
  shortName: 'shortName',
  slug: 'slug',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  educationId: 'educationId',
  visible: 'visible',
  description: 'description'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  name: 'name',
  shortName: 'shortName',
  description: 'description',
  slug: 'slug',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  startDate: 'startDate',
  highlighted: 'highlighted',
  visible: 'visible'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  name: 'name',
  shortName: 'shortName',
  description: 'description',
  logoImageUrl: 'logoImageUrl',
  websiteUrl: 'websiteUrl',
  city: 'city',
  state: 'state'
};

exports.Prisma.SchoolScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  name: 'name',
  shortName: 'shortName',
  description: 'description',
  logoImageUrl: 'logoImageUrl',
  websiteUrl: 'websiteUrl',
  city: 'city',
  state: 'state'
};

exports.Prisma.ExperienceScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  startDate: 'startDate',
  endDate: 'endDate',
  companyId: 'companyId',
  title: 'title',
  shortTitle: 'shortTitle',
  description: 'description',
  isCurrent: 'isCurrent',
  isRemote: 'isRemote',
  visible: 'visible',
  highlighted: 'highlighted'
};

exports.Prisma.EducationScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  startDate: 'startDate',
  endDate: 'endDate',
  note: 'note',
  degree: 'degree',
  description: 'description',
  major: 'major',
  shortMajor: 'shortMajor',
  minor: 'minor',
  concentration: 'concentration',
  schoolId: 'schoolId',
  postPoned: 'postPoned',
  visible: 'visible',
  highlighted: 'highlighted'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  createdById: 'createdById',
  updatedAt: 'updatedAt',
  updatedById: 'updatedById',
  firstName: 'firstName',
  lastName: 'lastName',
  displayName: 'displayName',
  middleName: 'middleName',
  profileImageUrl: 'profileImageUrl',
  emailAddress: 'emailAddress',
  phoneNumber: 'phoneNumber',
  intro: 'intro',
  tagline: 'tagline',
  githubUrl: 'githubUrl',
  linkedinUrl: 'linkedinUrl'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.DetailEntityType = exports.$Enums.DetailEntityType = {
  EXPERIENCE: 'EXPERIENCE',
  EDUCATION: 'EDUCATION'
};

exports.SkillCategory = exports.$Enums.SkillCategory = {
  DEVOPS: 'DEVOPS',
  DATABASE: 'DATABASE',
  API_DEVELOPMENT: 'API_DEVELOPMENT',
  TESTING: 'TESTING',
  PROGRAMMING_LANGUAGE: 'PROGRAMMING_LANGUAGE',
  FRAMEWORK: 'FRAMEWORK',
  PACKAGE: 'PACKAGE',
  PACKAGE_MANAGER: 'PACKAGE_MANAGER',
  VERSION_MANAGER: 'VERSION_MANAGER',
  LOGGING_ALERTING_MONITORING: 'LOGGING_ALERTING_MONITORING',
  ACADEMIC: 'ACADEMIC',
  ORM: 'ORM',
  WORKFLOW: 'WORKFLOW'
};

exports.ProgrammingLanguage = exports.$Enums.ProgrammingLanguage = {
  JAVASCRIPT: 'JAVASCRIPT',
  TYPESCRIPT: 'TYPESCRIPT',
  PYTHON: 'PYTHON',
  SWIFT: 'SWIFT',
  CSS: 'CSS',
  SCSS: 'SCSS',
  CPLUSPLUS: 'CPLUSPLUS',
  BASH: 'BASH',
  JQUERY: 'JQUERY',
  HTML: 'HTML',
  MATLAB: 'MATLAB',
  R: 'R',
  REACT: 'REACT',
  VBA: 'VBA'
};

exports.ProgrammingDomain = exports.$Enums.ProgrammingDomain = {
  BACKEND: 'BACKEND',
  FRONTEND: 'FRONTEND',
  MOBILE: 'MOBILE',
  FULL_STACK: 'FULL_STACK',
  INFRASTRUCTURE: 'INFRASTRUCTURE'
};

exports.Degree = exports.$Enums.Degree = {
  BACHELORS_OF_SCIENCE: 'BACHELORS_OF_SCIENCE',
  MASTERS_OF_SCIENCE_IN_ENGINEERING: 'MASTERS_OF_SCIENCE_IN_ENGINEERING',
  MASTERS_OF_SCIENCE: 'MASTERS_OF_SCIENCE'
};

exports.Prisma.ModelName = {
  User: 'User',
  NestedDetail: 'NestedDetail',
  Detail: 'Detail',
  Resume: 'Resume',
  Repository: 'Repository',
  Skill: 'Skill',
  Course: 'Course',
  Project: 'Project',
  Company: 'Company',
  School: 'School',
  Experience: 'Experience',
  Education: 'Education',
  Profile: 'Profile'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        const runtime = detectRuntime()
        const edgeRuntimeName = {
          'workerd': 'Cloudflare Workers',
          'deno': 'Deno and Deno Deploy',
          'netlify': 'Netlify Edge Functions',
          'edge-light': 'Vercel Edge Functions',
        }[runtime]

        let message = 'PrismaClient is unable to run in '
        if (edgeRuntimeName !== undefined) {
          message += edgeRuntimeName + '. As an alternative, try Accelerate: https://pris.ly/d/accelerate.'
        } else {
          message += 'this browser environment, or has been bundled for the browser (running in `' + runtime + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://github.com/prisma/prisma/issues`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
