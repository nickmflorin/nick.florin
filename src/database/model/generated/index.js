Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  detectRuntime,
} = require("./runtime/library");

const Prisma = {};

exports.Prisma = Prisma;
exports.$Enums = {};

/**
 * Prisma Client JS version: 5.8.0
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.8.0",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3",
};

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError;
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError;
Prisma.PrismaClientInitializationError = PrismaClientInitializationError;
Prisma.PrismaClientValidationError = PrismaClientValidationError;
Prisma.NotFoundError = NotFoundError;
Prisma.Decimal = Decimal;

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag;
Prisma.empty = empty;
Prisma.join = join;
Prisma.raw = raw;
Prisma.validator = Public.validator;

/**
 * Extensions
 */
Prisma.getExtensionContext = Extensions.getExtensionContext;
Prisma.defineExtension = Extensions.defineExtension;

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull,
};

const path = require("path");

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable",
});

exports.Prisma.UserScalarFieldEnum = {
  id: "id",
  clerkId: "clerkId",
  firstName: "firstName",
  lastName: "lastName",
  profileImageUrl: "profileImageUrl",
  emailAddress: "emailAddress",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

exports.Prisma.NestedDetailScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  label: "label",
  description: "description",
  shortDescription: "shortDescription",
  visible: "visible",
  detailId: "detailId",
  projectId: "projectId",
};

exports.Prisma.DetailScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  entityId: "entityId",
  entityType: "entityType",
  label: "label",
  description: "description",
  shortDescription: "shortDescription",
  visible: "visible",
  projectId: "projectId",
};

exports.Prisma.ResumeScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  primary: "primary",
  downloadUrl: "downloadUrl",
  url: "url",
  pathname: "pathname",
  filename: "filename",
  size: "size",
};

exports.Prisma.RepositoryScalarFieldEnum = {
  id: "id",
  slug: "slug",
  description: "description",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  visible: "visible",
  highlighted: "highlighted",
  startDate: "startDate",
  npmPackageName: "npmPackageName",
};

exports.Prisma.SkillScalarFieldEnum = {
  id: "id",
  label: "label",
  slug: "slug",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  visible: "visible",
  description: "description",
  categories: "categories",
  programmingLanguages: "programmingLanguages",
  programmingDomains: "programmingDomains",
  experience: "experience",
  calculatedExperience: "calculatedExperience",
  includeInTopSkills: "includeInTopSkills",
};

exports.Prisma.CourseScalarFieldEnum = {
  id: "id",
  name: "name",
  shortName: "shortName",
  slug: "slug",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  educationId: "educationId",
  visible: "visible",
  description: "description",
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: "id",
  name: "name",
  shortName: "shortName",
  description: "description",
  slug: "slug",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  startDate: "startDate",
  highlighted: "highlighted",
  visible: "visible",
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  name: "name",
  shortName: "shortName",
  description: "description",
  logoImageUrl: "logoImageUrl",
  websiteUrl: "websiteUrl",
  city: "city",
  state: "state",
};

exports.Prisma.SchoolScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  name: "name",
  shortName: "shortName",
  description: "description",
  logoImageUrl: "logoImageUrl",
  websiteUrl: "websiteUrl",
  city: "city",
  state: "state",
};

exports.Prisma.ExperienceScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  startDate: "startDate",
  endDate: "endDate",
  companyId: "companyId",
  title: "title",
  shortTitle: "shortTitle",
  description: "description",
  isRemote: "isRemote",
  visible: "visible",
  highlighted: "highlighted",
};

exports.Prisma.EducationScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  startDate: "startDate",
  endDate: "endDate",
  note: "note",
  degree: "degree",
  description: "description",
  major: "major",
  shortMajor: "shortMajor",
  minor: "minor",
  concentration: "concentration",
  schoolId: "schoolId",
  postPoned: "postPoned",
  visible: "visible",
  highlighted: "highlighted",
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  createdById: "createdById",
  updatedAt: "updatedAt",
  updatedById: "updatedById",
  firstName: "firstName",
  lastName: "lastName",
  displayName: "displayName",
  middleName: "middleName",
  profileImageUrl: "profileImageUrl",
  emailAddress: "emailAddress",
  phoneNumber: "phoneNumber",
  intro: "intro",
  tagline: "tagline",
  githubUrl: "githubUrl",
  linkedinUrl: "linkedinUrl",
};

exports.Prisma.SortOrder = {
  asc: "asc",
  desc: "desc",
};

exports.Prisma.QueryMode = {
  default: "default",
  insensitive: "insensitive",
};

exports.Prisma.NullsOrder = {
  first: "first",
  last: "last",
};
exports.DetailEntityType = exports.$Enums.DetailEntityType = {
  EXPERIENCE: "EXPERIENCE",
  EDUCATION: "EDUCATION",
};

exports.SkillCategory = exports.$Enums.SkillCategory = {
  DEVOPS: "DEVOPS",
  DATABASE: "DATABASE",
  API_DEVELOPMENT: "API_DEVELOPMENT",
  TESTING: "TESTING",
  PROGRAMMING_LANGUAGE: "PROGRAMMING_LANGUAGE",
  FRAMEWORK: "FRAMEWORK",
  PACKAGE: "PACKAGE",
  PACKAGE_MANAGER: "PACKAGE_MANAGER",
  VERSION_MANAGER: "VERSION_MANAGER",
  ORM: "ORM",
  WORKFLOW: "WORKFLOW",
};

exports.ProgrammingLanguage = exports.$Enums.ProgrammingLanguage = {
  JAVASCRIPT: "JAVASCRIPT",
  TYPESCRIPT: "TYPESCRIPT",
  PYTHON: "PYTHON",
  SWIFT: "SWIFT",
  CSS: "CSS",
  SCSS: "SCSS",
  CPLUSPLUS: "CPLUSPLUS",
  BASH: "BASH",
  JQUERY: "JQUERY",
  HTML: "HTML",
  MATLAB: "MATLAB",
  R: "R",
};

exports.ProgrammingDomain = exports.$Enums.ProgrammingDomain = {
  BACKEND: "BACKEND",
  FRONTEND: "FRONTEND",
  MOBILE: "MOBILE",
  FULL_STACK: "FULL_STACK",
};

exports.Degree = exports.$Enums.Degree = {
  BACHELORS_OF_SCIENCE: "BACHELORS_OF_SCIENCE",
  MASTERS_OF_SCIENCE_IN_ENGINEERING: "MASTERS_OF_SCIENCE_IN_ENGINEERING",
  MASTERS_OF_SCIENCE: "MASTERS_OF_SCIENCE",
};

exports.Prisma.ModelName = {
  User: "User",
  NestedDetail: "NestedDetail",
  Detail: "Detail",
  Resume: "Resume",
  Repository: "Repository",
  Skill: "Skill",
  Course: "Course",
  Project: "Project",
  Company: "Company",
  School: "School",
  Experience: "Experience",
  Education: "Education",
  Profile: "Profile",
};
/**
 * Create the Client
 */
const config = {
  generator: {
    name: "client",
    provider: {
      fromEnvVar: null,
      value: "prisma-client-js",
    },
    output: {
      value: "/Users/nickflorin/repos/website/src/prisma/model/generated",
      fromEnvVar: null,
    },
    config: {
      engineType: "library",
    },
    binaryTargets: [
      {
        fromEnvVar: null,
        value: "darwin-arm64",
        native: true,
      },
    ],
    previewFeatures: [],
    sourceFilePath: "/Users/nickflorin/repos/website/src/prisma/schema.prisma",
    isCustomOutput: true,
  },
  relativeEnvPaths: {
    rootEnvPath: "../../../../.env",
    schemaEnvPath: "../../../../.env",
  },
  relativePath: "../..",
  clientVersion: "5.8.0",
  engineVersion: "69d742ee20b815d88e17e54db4a2a7a3b30324e3",
  datasourceNames: ["db"],
  activeProvider: "postgresql",
  postinstall: false,
  ciName: "Vercel",
  inlineDatasources: {
    db: {
      url: {
        fromEnvVar: "POSTGRES_PRISMA_URL",
        value: null,
      },
    },
  },
  inlineSchema:
    "Z2VuZXJhdG9yIGNsaWVudCB7CiAgcHJvdmlkZXIgICAgICAgID0gInByaXNtYS1jbGllbnQtanMiCiAgcHJldmlld0ZlYXR1cmVzID0gW10KICBvdXRwdXQgICAgICAgICAgPSAiLi9tb2RlbC9nZW5lcmF0ZWQiCn0KCmRhdGFzb3VyY2UgZGIgewogIHByb3ZpZGVyICA9ICJwb3N0Z3Jlc3FsIgogIHVybCAgICAgICA9IGVudigiUE9TVEdSRVNfUFJJU01BX1VSTCIpIC8vIFVzZXMgQ29ubmVjdGlvbiBQb29saW5nCiAgZGlyZWN0VXJsID0gZW52KCJQT1NUR1JFU19VUkxfTk9OX1BPT0xJTkciKSAvLyBVc2VzIGEgRGlyZWN0IENvbm5lY3Rpb24KfQoKbW9kZWwgVXNlciB7CiAgaWQgICAgICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgQGlkIEBkZWZhdWx0KHV1aWQoKSkgQGRiLlV1aWQKICBjbGVya0lkICAgICAgICAgICAgICBTdHJpbmcgICAgICAgICBAdW5pcXVlCiAgZmlyc3ROYW1lICAgICAgICAgICAgU3RyaW5nCiAgbGFzdE5hbWUgICAgICAgICAgICAgU3RyaW5nCiAgcHJvZmlsZUltYWdlVXJsICAgICAgU3RyaW5nPwogIGVtYWlsQWRkcmVzcyAgICAgICAgIFN0cmluZwogIGNyZWF0ZWRBdCAgICAgICAgICAgIERhdGVUaW1lICAgICAgIEBkZWZhdWx0KG5vdygpKQogIHVwZGF0ZWRBdCAgICAgICAgICAgIERhdGVUaW1lICAgICAgIEB1cGRhdGVkQXQKICB1cGRhdGVkU2tpbGxzICAgICAgICBTa2lsbFtdICAgICAgICBAcmVsYXRpb24oInVwZGF0ZWRTa2lsbHMiKQogIGNyZWF0ZWRTa2lsbHMgICAgICAgIFNraWxsW10gICAgICAgIEByZWxhdGlvbigiY3JlYXRlZFNraWxscyIpCiAgdXBkYXRlZENvbXBhbmllcyAgICAgQ29tcGFueVtdICAgICAgQHJlbGF0aW9uKCJ1cGRhdGVkQ29tcGFuaWVzIikKICBjcmVhdGVkQ29tcGFuaWVzICAgICBDb21wYW55W10gICAgICBAcmVsYXRpb24oImNyZWF0ZWRDb21wYW5pZXMiKQogIHVwZGF0ZWRFeHBlcmllbmNlcyAgIEV4cGVyaWVuY2VbXSAgIEByZWxhdGlvbigidXBkYXRlZEV4cGVyaWVuY2VzIikKICBjcmVhdGVkRXhwZXJpZW5jZXMgICBFeHBlcmllbmNlW10gICBAcmVsYXRpb24oImNyZWF0ZWRFeHBlcmllbmNlcyIpCiAgdXBkYXRlZFNjaG9vbHMgICAgICAgU2Nob29sW10gICAgICAgQHJlbGF0aW9uKCJ1cGRhdGVkU2Nob29scyIpCiAgY3JlYXRlZFNjaG9vbHMgICAgICAgU2Nob29sW10gICAgICAgQHJlbGF0aW9uKCJjcmVhdGVkU2Nob29scyIpCiAgdXBkYXRlZEVkdWNhdGlvbnMgICAgRWR1Y2F0aW9uW10gICAgQHJlbGF0aW9uKCJ1cGRhdGVkRWR1Y2F0aW9ucyIpCiAgY3JlYXRlZEVkdWNhdGlvbnMgICAgRWR1Y2F0aW9uW10gICAgQHJlbGF0aW9uKCJjcmVhdGVkRWR1Y2F0aW9ucyIpCiAgdXBkYXRlZFByb2ZpbGVzICAgICAgUHJvZmlsZVtdICAgICAgQHJlbGF0aW9uKCJ1cGRhdGVkUHJvZmlsZXMiKQogIGNyZWF0ZWRQcm9maWxlcyAgICAgIFByb2ZpbGVbXSAgICAgIEByZWxhdGlvbigiY3JlYXRlZFByb2ZpbGVzIikKICB1cGRhdGVkRGV0YWlscyAgICAgICBEZXRhaWxbXSAgICAgICBAcmVsYXRpb24oInVwZGF0ZWREZXRhaWxzIikKICBjcmVhdGVkRGV0YWlscyAgICAgICBEZXRhaWxbXSAgICAgICBAcmVsYXRpb24oImNyZWF0ZWREZXRhaWxzIikKICB1cGRhdGVkTmVzdGVkRGV0YWlscyBOZXN0ZWREZXRhaWxbXSBAcmVsYXRpb24oInVwZGF0ZWROZXN0ZWREZXRhaWxzIikKICBjcmVhdGVkTmVzdGVkRGV0YWlscyBOZXN0ZWREZXRhaWxbXSBAcmVsYXRpb24oImNyZWF0ZWROZXN0ZWREZXRhaWxzIikKICB1cGRhdGVkQ291cnNlcyAgICAgICBDb3Vyc2VbXSAgICAgICBAcmVsYXRpb24oInVwZGF0ZWRDb3Vyc2VzIikKICBjcmVhdGVkQ291cnNlcyAgICAgICBDb3Vyc2VbXSAgICAgICBAcmVsYXRpb24oImNyZWF0ZWRDb3Vyc2VzIikKICB1cGRhdGVkUHJvamVjdHMgICAgICBQcm9qZWN0W10gICAgICBAcmVsYXRpb24oInVwZGF0ZWRQcm9qZWN0cyIpCiAgY3JlYXRlZFByb2plY3RzICAgICAgUHJvamVjdFtdICAgICAgQHJlbGF0aW9uKCJjcmVhdGVkUHJvamVjdHMiKQogIHVwZGF0ZWRSZXBvc2l0b3JpZXMgIFJlcG9zaXRvcnlbXSAgIEByZWxhdGlvbigidXBkYXRlZFJlcG9zaXRvcmllcyIpCiAgY3JlYXRlZFJlcG9zaXRvcmllcyAgUmVwb3NpdG9yeVtdICAgQHJlbGF0aW9uKCJjcmVhdGVkUmVwb3NpdG9yaWVzIikKICB1cGRhdGVkUmVzdW1lcyAgICAgICBSZXN1bWVbXSAgICAgICBAcmVsYXRpb24oInVwZGF0ZWRSZXN1bWVzIikKICBjcmVhdGVkUmVzdW1lcyAgICAgICBSZXN1bWVbXSAgICAgICBAcmVsYXRpb24oImNyZWF0ZWRSZXN1bWVzIikKfQoKbW9kZWwgTmVzdGVkRGV0YWlsIHsKICBpZCAgICAgICAgICAgICAgIFN0cmluZyAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpIEBkYi5VdWlkCiAgY3JlYXRlZEF0ICAgICAgICBEYXRlVGltZSBAZGVmYXVsdChub3coKSkKICBjcmVhdGVkQnkgICAgICAgIFVzZXIgICAgIEByZWxhdGlvbigiY3JlYXRlZE5lc3RlZERldGFpbHMiLCBmaWVsZHM6IFtjcmVhdGVkQnlJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgY3JlYXRlZEJ5SWQgICAgICBTdHJpbmcgICBAZGIuVXVpZAogIHVwZGF0ZWRBdCAgICAgICAgRGF0ZVRpbWUgQHVwZGF0ZWRBdAogIHVwZGF0ZWRCeSAgICAgICAgVXNlciAgICAgQHJlbGF0aW9uKCJ1cGRhdGVkTmVzdGVkRGV0YWlscyIsIGZpZWxkczogW3VwZGF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICB1cGRhdGVkQnlJZCAgICAgIFN0cmluZyAgIEBkYi5VdWlkCiAgbGFiZWwgICAgICAgICAgICBTdHJpbmcKICBkZXNjcmlwdGlvbiAgICAgIFN0cmluZz8KICBzaG9ydERlc2NyaXB0aW9uIFN0cmluZz8KICB2aXNpYmxlICAgICAgICAgIEJvb2xlYW4gIEBkZWZhdWx0KHRydWUpCiAgZGV0YWlsICAgICAgICAgICBEZXRhaWwgICBAcmVsYXRpb24oIm5lc3RlZERldGFpbHMiLCBmaWVsZHM6IFtkZXRhaWxJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgZGV0YWlsSWQgICAgICAgICBTdHJpbmcgICBAZGIuVXVpZAogIHByb2plY3QgICAgICAgICAgUHJvamVjdD8gQHJlbGF0aW9uKCJuZXN0ZWREZXRhaWxzIiwgZmllbGRzOiBbcHJvamVjdElkXSwgcmVmZXJlbmNlczogW2lkXSkKICBwcm9qZWN0SWQgICAgICAgIFN0cmluZz8gIEBkYi5VdWlkCiAgc2tpbGxzICAgICAgICAgICBTa2lsbFtdICBAcmVsYXRpb24oIm5lc3RlZERldGFpbFNraWxscyIpCgogIEBAdW5pcXVlKFtsYWJlbCwgZGV0YWlsSWRdKQp9CgplbnVtIERldGFpbEVudGl0eVR5cGUgewogIEVYUEVSSUVOQ0UKICBFRFVDQVRJT04KfQoKbW9kZWwgRGV0YWlsIHsKICBpZCAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgQGlkIEBkZWZhdWx0KHV1aWQoKSkgQGRiLlV1aWQKICBjcmVhdGVkQXQgICAgICAgIERhdGVUaW1lICAgICAgICAgQGRlZmF1bHQobm93KCkpCiAgY3JlYXRlZEJ5ICAgICAgICBVc2VyICAgICAgICAgICAgIEByZWxhdGlvbigiY3JlYXRlZERldGFpbHMiLCBmaWVsZHM6IFtjcmVhdGVkQnlJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgY3JlYXRlZEJ5SWQgICAgICBTdHJpbmcgICAgICAgICAgIEBkYi5VdWlkCiAgdXBkYXRlZEF0ICAgICAgICBEYXRlVGltZSAgICAgICAgIEB1cGRhdGVkQXQKICB1cGRhdGVkQnkgICAgICAgIFVzZXIgICAgICAgICAgICAgQHJlbGF0aW9uKCJ1cGRhdGVkRGV0YWlscyIsIGZpZWxkczogW3VwZGF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICB1cGRhdGVkQnlJZCAgICAgIFN0cmluZyAgICAgICAgICAgQGRiLlV1aWQKICBlbnRpdHlJZCAgICAgICAgIFN0cmluZyAgICAgICAgICAgQGRiLlV1aWQKICBlbnRpdHlUeXBlICAgICAgIERldGFpbEVudGl0eVR5cGUKICBsYWJlbCAgICAgICAgICAgIFN0cmluZwogIGRlc2NyaXB0aW9uICAgICAgU3RyaW5nPwogIHNob3J0RGVzY3JpcHRpb24gU3RyaW5nPwogIHZpc2libGUgICAgICAgICAgQm9vbGVhbiAgICAgICAgICBAZGVmYXVsdCh0cnVlKQogIG5lc3RlZERldGFpbHMgICAgTmVzdGVkRGV0YWlsW10gICBAcmVsYXRpb24oIm5lc3RlZERldGFpbHMiKQogIHByb2plY3QgICAgICAgICAgUHJvamVjdD8gICAgICAgICBAcmVsYXRpb24oImRldGFpbHMiLCBmaWVsZHM6IFtwcm9qZWN0SWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIHByb2plY3RJZCAgICAgICAgU3RyaW5nPyAgICAgICAgICBAZGIuVXVpZAogIHNraWxscyAgICAgICAgICAgU2tpbGxbXSAgICAgICAgICBAcmVsYXRpb24oImRldGFpbFNraWxscyIpCgogIEBAdW5pcXVlKFtsYWJlbCwgZW50aXR5SWQsIGVudGl0eVR5cGVdKQp9CgplbnVtIFNraWxsQ2F0ZWdvcnkgewogIERFVk9QUwogIERBVEFCQVNFCiAgQVBJX0RFVkVMT1BNRU5UCiAgVEVTVElORwogIFBST0dSQU1NSU5HX0xBTkdVQUdFCiAgRlJBTUVXT1JLCiAgUEFDS0FHRQogIFBBQ0tBR0VfTUFOQUdFUgogIFZFUlNJT05fTUFOQUdFUgogIE9STQogIFdPUktGTE9XCn0KCmVudW0gUHJvZ3JhbW1pbmdEb21haW4gewogIEJBQ0tFTkQKICBGUk9OVEVORAogIE1PQklMRQogIEZVTExfU1RBQ0sKfQoKZW51bSBQcm9ncmFtbWluZ0xhbmd1YWdlIHsKICBKQVZBU0NSSVBUCiAgVFlQRVNDUklQVAogIFBZVEhPTgogIFNXSUZUCiAgQ1NTCiAgU0NTUwogIENQTFVTUExVUwogIEJBU0gKICBKUVVFUlkKICBIVE1MCiAgTUFUTEFCCiAgUgp9Cgptb2RlbCBSZXN1bWUgewogIGlkICAgICAgICAgIFN0cmluZyAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpIEBkYi5VdWlkCiAgY3JlYXRlZEF0ICAgRGF0ZVRpbWUgQGRlZmF1bHQobm93KCkpCiAgY3JlYXRlZEJ5ICAgVXNlciAgICAgQHJlbGF0aW9uKCJjcmVhdGVkUmVzdW1lcyIsIGZpZWxkczogW2NyZWF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICBjcmVhdGVkQnlJZCBTdHJpbmcgICBAZGIuVXVpZAogIHVwZGF0ZWRBdCAgIERhdGVUaW1lIEB1cGRhdGVkQXQKICB1cGRhdGVkQnkgICBVc2VyICAgICBAcmVsYXRpb24oInVwZGF0ZWRSZXN1bWVzIiwgZmllbGRzOiBbdXBkYXRlZEJ5SWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIHVwZGF0ZWRCeUlkIFN0cmluZyAgIEBkYi5VdWlkCiAgcHJpbWFyeSAgICAgQm9vbGVhbiAgQGRlZmF1bHQoZmFsc2UpCiAgZG93bmxvYWRVcmwgU3RyaW5nCiAgdXJsICAgICAgICAgU3RyaW5nCiAgcGF0aG5hbWUgICAgU3RyaW5nCiAgZmlsZW5hbWUgICAgU3RyaW5nCiAgc2l6ZSAgICAgICAgQmlnSW50Cn0KCm1vZGVsIFJlcG9zaXRvcnkgewogIGlkICAgICAgICAgICAgIFN0cmluZyAgICBAaWQgQGRlZmF1bHQodXVpZCgpKSBAZGIuVXVpZAogIHNsdWcgICAgICAgICAgIFN0cmluZyAgICBAdW5pcXVlCiAgZGVzY3JpcHRpb24gICAgU3RyaW5nPwogIGNyZWF0ZWRBdCAgICAgIERhdGVUaW1lICBAZGVmYXVsdChub3coKSkKICBjcmVhdGVkQnkgICAgICBVc2VyICAgICAgQHJlbGF0aW9uKCJjcmVhdGVkUmVwb3NpdG9yaWVzIiwgZmllbGRzOiBbY3JlYXRlZEJ5SWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIGNyZWF0ZWRCeUlkICAgIFN0cmluZyAgICBAZGIuVXVpZAogIHVwZGF0ZWRBdCAgICAgIERhdGVUaW1lICBAdXBkYXRlZEF0CiAgdXBkYXRlZEJ5ICAgICAgVXNlciAgICAgIEByZWxhdGlvbigidXBkYXRlZFJlcG9zaXRvcmllcyIsIGZpZWxkczogW3VwZGF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICB1cGRhdGVkQnlJZCAgICBTdHJpbmcgICAgQGRiLlV1aWQKICBza2lsbHMgICAgICAgICBTa2lsbFtdICAgQHJlbGF0aW9uKCJza2lsbFJlcG9zaXRvcmllcyIpCiAgcHJvamVjdHMgICAgICAgUHJvamVjdFtdIEByZWxhdGlvbigicHJvamVjdFJlcG9zaXRvcmllcyIpCiAgdmlzaWJsZSAgICAgICAgQm9vbGVhbiAgIEBkZWZhdWx0KGZhbHNlKQogIGhpZ2hsaWdodGVkICAgIEJvb2xlYW4gICBAZGVmYXVsdChmYWxzZSkKICAvLyBUaGUgc3RhcnQgZGF0ZSBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgZXhwZXJpZW5jZSBvZiBhIGdpdmVuIHNraWxsIGluIHRoZSByZXBvc2l0b3J5LgogIHN0YXJ0RGF0ZSAgICAgIERhdGVUaW1lCiAgbnBtUGFja2FnZU5hbWUgU3RyaW5nPyAgIEB1bmlxdWUKfQoKbW9kZWwgU2tpbGwgewogIGlkICAgICAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICBAaWQgQGRlZmF1bHQodXVpZCgpKSBAZGIuVXVpZAogIGxhYmVsICAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICBAdW5pcXVlCiAgc2x1ZyAgICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgIEB1bmlxdWUKICBjcmVhdGVkQXQgICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgQGRlZmF1bHQobm93KCkpCiAgY3JlYXRlZEJ5ICAgICAgICAgICAgVXNlciAgICAgICAgICAgICAgICAgIEByZWxhdGlvbigiY3JlYXRlZFNraWxscyIsIGZpZWxkczogW2NyZWF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICBjcmVhdGVkQnlJZCAgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgQGRiLlV1aWQKICB1cGRhdGVkQXQgICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgQHVwZGF0ZWRBdAogIHVwZGF0ZWRCeSAgICAgICAgICAgIFVzZXIgICAgICAgICAgICAgICAgICBAcmVsYXRpb24oInVwZGF0ZWRTa2lsbHMiLCBmaWVsZHM6IFt1cGRhdGVkQnlJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgdXBkYXRlZEJ5SWQgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgIEBkYi5VdWlkCiAgZXhwZXJpZW5jZXMgICAgICAgICAgRXhwZXJpZW5jZVtdICAgICAgICAgIEByZWxhdGlvbigiZXhwZXJpZW5jZVNraWxscyIpCiAgZWR1Y2F0aW9ucyAgICAgICAgICAgRWR1Y2F0aW9uW10gICAgICAgICAgIEByZWxhdGlvbigiZWR1Y2F0aW9uU2tpbGxzIikKICB2aXNpYmxlICAgICAgICAgICAgICBCb29sZWFuICAgICAgICAgICAgICAgQGRlZmF1bHQodHJ1ZSkKICBkZXNjcmlwdGlvbiAgICAgICAgICBTdHJpbmc/CiAgY2F0ZWdvcmllcyAgICAgICAgICAgU2tpbGxDYXRlZ29yeVtdICAgICAgIEBkZWZhdWx0KFtdKQogIHByb2dyYW1taW5nTGFuZ3VhZ2VzIFByb2dyYW1taW5nTGFuZ3VhZ2VbXSBAZGVmYXVsdChbXSkKICBwcm9ncmFtbWluZ0RvbWFpbnMgICBQcm9ncmFtbWluZ0RvbWFpbltdICAgQGRlZmF1bHQoW10pCiAgLy8gTnVtYmVyIG9mIHllYXJzIHRoYXQgdGhlIHNraWxsIGhhcyBiZWVuIHVzZWQgaW4gYWNhZGVtaWMvcHJvZmVzc2lvbmFsIHNldHRpbmdzLiAgSWYgbm90CiAgLy8gZGVmaW5lZCwgaXQgbWF5IGJlIGRldGVybWluZWQgYmFzZWQgb24gdGhlIG9sZGVzdCBleHBlcmllbmNlIGFuZC9vciBlZHVjYXRpb24gaXQgaXMgYXNzb2NpYXRlZAogIC8vIHdpdGguCiAgZXhwZXJpZW5jZSAgICAgICAgICAgSW50PwogIGNhbGN1bGF0ZWRFeHBlcmllbmNlIEludAogIGluY2x1ZGVJblRvcFNraWxscyAgIEJvb2xlYW4gICAgICAgICAgICAgICBAZGVmYXVsdChmYWxzZSkKICBjb3Vyc2VzICAgICAgICAgICAgICBDb3Vyc2VbXSAgICAgICAgICAgICAgQHJlbGF0aW9uKCJjb3Vyc2VTa2lsbHMiKQogIHByb2plY3RzICAgICAgICAgICAgIFByb2plY3RbXSAgICAgICAgICAgICBAcmVsYXRpb24oInByb2plY3RTa2lsbHMiKQogIGRldGFpbHMgICAgICAgICAgICAgIERldGFpbFtdICAgICAgICAgICAgICBAcmVsYXRpb24oImRldGFpbFNraWxscyIpCiAgbmVzdGVkRGV0YWlscyAgICAgICAgTmVzdGVkRGV0YWlsW10gICAgICAgIEByZWxhdGlvbigibmVzdGVkRGV0YWlsU2tpbGxzIikKICByZXBvc2l0b3JpZXMgICAgICAgICBSZXBvc2l0b3J5W10gICAgICAgICAgQHJlbGF0aW9uKCJza2lsbFJlcG9zaXRvcmllcyIpCn0KCm1vZGVsIENvdXJzZSB7CiAgaWQgICAgICAgICAgU3RyaW5nICAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpIEBkYi5VdWlkCiAgbmFtZSAgICAgICAgU3RyaW5nICAgIEB1bmlxdWUKICBzaG9ydE5hbWUgICBTdHJpbmc/ICAgQHVuaXF1ZQogIC8vIFRoaXMgaXMgY3VycmVudGx5IG5vdCBiZWluZyB1c2VkLCBhbmQgd2UgbWF5IHdhbnQgdG8gcmVtb3ZlIGl0IGluIHRoZSBuZWFyIGZ1dHVyZS4KICBzbHVnICAgICAgICBTdHJpbmcgICAgQHVuaXF1ZQogIGNyZWF0ZWRBdCAgIERhdGVUaW1lICBAZGVmYXVsdChub3coKSkKICBjcmVhdGVkQnkgICBVc2VyICAgICAgQHJlbGF0aW9uKCJjcmVhdGVkQ291cnNlcyIsIGZpZWxkczogW2NyZWF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICBjcmVhdGVkQnlJZCBTdHJpbmcgICAgQGRiLlV1aWQKICB1cGRhdGVkQXQgICBEYXRlVGltZSAgQHVwZGF0ZWRBdAogIHVwZGF0ZWRCeSAgIFVzZXIgICAgICBAcmVsYXRpb24oInVwZGF0ZWRDb3Vyc2VzIiwgZmllbGRzOiBbdXBkYXRlZEJ5SWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIHVwZGF0ZWRCeUlkIFN0cmluZyAgICBAZGIuVXVpZAogIGVkdWNhdGlvbiAgIEVkdWNhdGlvbiBAcmVsYXRpb24oImNvdXJzZXMiLCBmaWVsZHM6IFtlZHVjYXRpb25JZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgZWR1Y2F0aW9uSWQgU3RyaW5nICAgIEBkYi5VdWlkCiAgdmlzaWJsZSAgICAgQm9vbGVhbiAgIEBkZWZhdWx0KHRydWUpCiAgZGVzY3JpcHRpb24gU3RyaW5nPwogIHNraWxscyAgICAgIFNraWxsW10gICBAcmVsYXRpb24oImNvdXJzZVNraWxscyIpCn0KCm1vZGVsIFByb2plY3QgewogIGlkICAgICAgICAgICAgU3RyaW5nICAgICAgICAgQGlkIEBkZWZhdWx0KHV1aWQoKSkgQGRiLlV1aWQKICBuYW1lICAgICAgICAgIFN0cmluZyAgICAgICAgIEB1bmlxdWUKICBzaG9ydE5hbWUgICAgIFN0cmluZz8gICAgICAgIEB1bmlxdWUKICAvLyBUT0RPOiBXZSBtYXkgd2FudCB0byB1c2UgYSByaWNoIHRleHQgZWRpdG9yIGZvciB0aGlzIGluIHRoZSBmdXR1cmUsIHNvIHdlIGNhbiBzaG93IGl0IG9uIHRoZQogIC8vIHByb2plY3RzIHBhZ2Ugd2l0aCBlbWJlZGRlZCBsaW5rcyBhbmQgdGhpbmdzIG9mIHRoYXQgbmF0dXJlLgogIGRlc2NyaXB0aW9uICAgU3RyaW5nCiAgc2x1ZyAgICAgICAgICBTdHJpbmcgICAgICAgICBAdW5pcXVlCiAgY3JlYXRlZEF0ICAgICBEYXRlVGltZSAgICAgICBAZGVmYXVsdChub3coKSkKICBjcmVhdGVkQnkgICAgIFVzZXIgICAgICAgICAgIEByZWxhdGlvbigiY3JlYXRlZFByb2plY3RzIiwgZmllbGRzOiBbY3JlYXRlZEJ5SWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIGNyZWF0ZWRCeUlkICAgU3RyaW5nICAgICAgICAgQGRiLlV1aWQKICB1cGRhdGVkQXQgICAgIERhdGVUaW1lICAgICAgIEB1cGRhdGVkQXQKICB1cGRhdGVkQnkgICAgIFVzZXIgICAgICAgICAgIEByZWxhdGlvbigidXBkYXRlZFByb2plY3RzIiwgZmllbGRzOiBbdXBkYXRlZEJ5SWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIHVwZGF0ZWRCeUlkICAgU3RyaW5nICAgICAgICAgQGRiLlV1aWQKICAvLyBUaGUgc3RhcnQgZGF0ZSBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgZXhwZXJpZW5jZSBvZiBhIGdpdmVuIHNraWxsIGluIHRoZSBwcm9qZWN0LgogIHN0YXJ0RGF0ZSAgICAgRGF0ZVRpbWUKICBza2lsbHMgICAgICAgIFNraWxsW10gICAgICAgIEByZWxhdGlvbigicHJvamVjdFNraWxscyIpCiAgZGV0YWlscyAgICAgICBEZXRhaWxbXSAgICAgICBAcmVsYXRpb24oImRldGFpbHMiKQogIG5lc3RlZERldGFpbHMgTmVzdGVkRGV0YWlsW10gQHJlbGF0aW9uKCJuZXN0ZWREZXRhaWxzIikKICByZXBvc2l0b3JpZXMgIFJlcG9zaXRvcnlbXSAgIEByZWxhdGlvbigicHJvamVjdFJlcG9zaXRvcmllcyIpCiAgaGlnaGxpZ2h0ZWQgICBCb29sZWFuICAgICAgICBAZGVmYXVsdChmYWxzZSkKICB2aXNpYmxlICAgICAgIEJvb2xlYW4gICAgICAgIEBkZWZhdWx0KGZhbHNlKQp9Cgptb2RlbCBDb21wYW55IHsKICBpZCAgICAgICAgICAgU3RyaW5nICAgICAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpIEBkYi5VdWlkCiAgY3JlYXRlZEF0ICAgIERhdGVUaW1lICAgICBAZGVmYXVsdChub3coKSkKICBjcmVhdGVkQnkgICAgVXNlciAgICAgICAgIEByZWxhdGlvbigiY3JlYXRlZENvbXBhbmllcyIsIGZpZWxkczogW2NyZWF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICBjcmVhdGVkQnlJZCAgU3RyaW5nICAgICAgIEBkYi5VdWlkCiAgdXBkYXRlZEF0ICAgIERhdGVUaW1lICAgICBAdXBkYXRlZEF0CiAgdXBkYXRlZEJ5ICAgIFVzZXIgICAgICAgICBAcmVsYXRpb24oInVwZGF0ZWRDb21wYW5pZXMiLCBmaWVsZHM6IFt1cGRhdGVkQnlJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgdXBkYXRlZEJ5SWQgIFN0cmluZyAgICAgICBAZGIuVXVpZAogIG5hbWUgICAgICAgICBTdHJpbmcgICAgICAgQHVuaXF1ZQogIHNob3J0TmFtZSAgICBTdHJpbmc/ICAgICAgQHVuaXF1ZQogIGRlc2NyaXB0aW9uICBTdHJpbmc/CiAgbG9nb0ltYWdlVXJsIFN0cmluZz8KICB3ZWJzaXRlVXJsICAgU3RyaW5nPwogIGV4cGVyaWVuY2VzICBFeHBlcmllbmNlW10gQHJlbGF0aW9uKCJleHBlcmllbmNlcyIpCiAgY2l0eSAgICAgICAgIFN0cmluZwogIHN0YXRlICAgICAgICBTdHJpbmcKfQoKbW9kZWwgU2Nob29sIHsKICBpZCAgICAgICAgICAgU3RyaW5nICAgICAgQGlkIEBkZWZhdWx0KHV1aWQoKSkgQGRiLlV1aWQKICBjcmVhdGVkQXQgICAgRGF0ZVRpbWUgICAgQGRlZmF1bHQobm93KCkpCiAgY3JlYXRlZEJ5ICAgIFVzZXIgICAgICAgIEByZWxhdGlvbigiY3JlYXRlZFNjaG9vbHMiLCBmaWVsZHM6IFtjcmVhdGVkQnlJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgY3JlYXRlZEJ5SWQgIFN0cmluZyAgICAgIEBkYi5VdWlkCiAgdXBkYXRlZEF0ICAgIERhdGVUaW1lICAgIEB1cGRhdGVkQXQKICB1cGRhdGVkQnkgICAgVXNlciAgICAgICAgQHJlbGF0aW9uKCJ1cGRhdGVkU2Nob29scyIsIGZpZWxkczogW3VwZGF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICB1cGRhdGVkQnlJZCAgU3RyaW5nICAgICAgQGRiLlV1aWQKICBuYW1lICAgICAgICAgU3RyaW5nICAgICAgQHVuaXF1ZQogIHNob3J0TmFtZSAgICBTdHJpbmc/ICAgICBAdW5pcXVlCiAgZGVzY3JpcHRpb24gIFN0cmluZz8KICBsb2dvSW1hZ2VVcmwgU3RyaW5nPwogIHdlYnNpdGVVcmwgICBTdHJpbmc/CiAgZWR1Y2F0aW9ucyAgIEVkdWNhdGlvbltdIEByZWxhdGlvbigiZWR1Y2F0aW9ucyIpCiAgY2l0eSAgICAgICAgIFN0cmluZwogIHN0YXRlICAgICAgICBTdHJpbmcKfQoKbW9kZWwgRXhwZXJpZW5jZSB7CiAgaWQgICAgICAgICAgU3RyaW5nICAgIEBpZCBAZGVmYXVsdCh1dWlkKCkpIEBkYi5VdWlkCiAgY3JlYXRlZEF0ICAgRGF0ZVRpbWUgIEBkZWZhdWx0KG5vdygpKQogIGNyZWF0ZWRCeSAgIFVzZXIgICAgICBAcmVsYXRpb24oImNyZWF0ZWRFeHBlcmllbmNlcyIsIGZpZWxkczogW2NyZWF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICBjcmVhdGVkQnlJZCBTdHJpbmcgICAgQGRiLlV1aWQKICB1cGRhdGVkQXQgICBEYXRlVGltZSAgQHVwZGF0ZWRBdAogIHVwZGF0ZWRCeSAgIFVzZXIgICAgICBAcmVsYXRpb24oInVwZGF0ZWRFeHBlcmllbmNlcyIsIGZpZWxkczogW3VwZGF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICB1cGRhdGVkQnlJZCBTdHJpbmcgICAgQGRiLlV1aWQKICBza2lsbHMgICAgICBTa2lsbFtdICAgQHJlbGF0aW9uKCJleHBlcmllbmNlU2tpbGxzIikKICBzdGFydERhdGUgICBEYXRlVGltZQogIGVuZERhdGUgICAgIERhdGVUaW1lPwogIGNvbXBhbnkgICAgIENvbXBhbnkgICBAcmVsYXRpb24oImV4cGVyaWVuY2VzIiwgZmllbGRzOiBbY29tcGFueUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICBjb21wYW55SWQgICBTdHJpbmcgICAgQGRiLlV1aWQKICB0aXRsZSAgICAgICBTdHJpbmcKICBzaG9ydFRpdGxlICBTdHJpbmc/CiAgZGVzY3JpcHRpb24gU3RyaW5nPwogIGlzUmVtb3RlICAgIEJvb2xlYW4gICBAZGVmYXVsdChmYWxzZSkKICB2aXNpYmxlICAgICBCb29sZWFuICAgQGRlZmF1bHQodHJ1ZSkKICBoaWdobGlnaHRlZCBCb29sZWFuICAgQGRlZmF1bHQodHJ1ZSkKCiAgQEB1bmlxdWUoW3RpdGxlLCBjb21wYW55SWRdKQp9CgplbnVtIERlZ3JlZSB7CiAgQkFDSEVMT1JTX09GX1NDSUVOQ0UKICBNQVNURVJTX09GX1NDSUVOQ0VfSU5fRU5HSU5FRVJJTkcKICBNQVNURVJTX09GX1NDSUVOQ0UKfQoKbW9kZWwgRWR1Y2F0aW9uIHsKICBpZCAgICAgICAgICAgIFN0cmluZyAgICBAaWQgQGRlZmF1bHQodXVpZCgpKSBAZGIuVXVpZAogIGNyZWF0ZWRBdCAgICAgRGF0ZVRpbWUgIEBkZWZhdWx0KG5vdygpKQogIGNyZWF0ZWRCeSAgICAgVXNlciAgICAgIEByZWxhdGlvbigiY3JlYXRlZEVkdWNhdGlvbnMiLCBmaWVsZHM6IFtjcmVhdGVkQnlJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgY3JlYXRlZEJ5SWQgICBTdHJpbmcgICAgQGRiLlV1aWQKICB1cGRhdGVkQXQgICAgIERhdGVUaW1lICBAdXBkYXRlZEF0CiAgdXBkYXRlZEJ5ICAgICBVc2VyICAgICAgQHJlbGF0aW9uKCJ1cGRhdGVkRWR1Y2F0aW9ucyIsIGZpZWxkczogW3VwZGF0ZWRCeUlkXSwgcmVmZXJlbmNlczogW2lkXSkKICB1cGRhdGVkQnlJZCAgIFN0cmluZyAgICBAZGIuVXVpZAogIHNraWxscyAgICAgICAgU2tpbGxbXSAgIEByZWxhdGlvbigiZWR1Y2F0aW9uU2tpbGxzIikKICBzdGFydERhdGUgICAgIERhdGVUaW1lCiAgZW5kRGF0ZSAgICAgICBEYXRlVGltZT8KICBub3RlICAgICAgICAgIFN0cmluZz8KICBkZWdyZWUgICAgICAgIERlZ3JlZQogIGRlc2NyaXB0aW9uICAgU3RyaW5nPwogIG1ham9yICAgICAgICAgU3RyaW5nCiAgc2hvcnRNYWpvciAgICBTdHJpbmc/CiAgbWlub3IgICAgICAgICBTdHJpbmc/CiAgY29uY2VudHJhdGlvbiBTdHJpbmc/CiAgc2Nob29sICAgICAgICBTY2hvb2wgICAgQHJlbGF0aW9uKCJlZHVjYXRpb25zIiwgZmllbGRzOiBbc2Nob29sSWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIHNjaG9vbElkICAgICAgU3RyaW5nICAgIEBkYi5VdWlkCiAgcG9zdFBvbmVkICAgICBCb29sZWFuICAgQGRlZmF1bHQoZmFsc2UpCiAgdmlzaWJsZSAgICAgICBCb29sZWFuICAgQGRlZmF1bHQodHJ1ZSkKICBoaWdobGlnaHRlZCAgIEJvb2xlYW4gICBAZGVmYXVsdCh0cnVlKQogIGNvdXJzZXMgICAgICAgQ291cnNlW10gIEByZWxhdGlvbigiY291cnNlcyIpCgogIEBAdW5pcXVlKFttYWpvciwgc2Nob29sSWRdKQogIEBAdW5pcXVlKFtzaG9ydE1ham9yLCBzY2hvb2xJZF0pCn0KCm1vZGVsIFByb2ZpbGUgewogIGlkICAgICAgICAgICAgICBTdHJpbmcgICBAaWQgQGRlZmF1bHQodXVpZCgpKSBAZGIuVXVpZAogIGNyZWF0ZWRBdCAgICAgICBEYXRlVGltZSBAZGVmYXVsdChub3coKSkKICBjcmVhdGVkQnkgICAgICAgVXNlciAgICAgQHJlbGF0aW9uKCJjcmVhdGVkUHJvZmlsZXMiLCBmaWVsZHM6IFtjcmVhdGVkQnlJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgY3JlYXRlZEJ5SWQgICAgIFN0cmluZyAgIEBkYi5VdWlkCiAgdXBkYXRlZEF0ICAgICAgIERhdGVUaW1lIEB1cGRhdGVkQXQKICB1cGRhdGVkQnkgICAgICAgVXNlciAgICAgQHJlbGF0aW9uKCJ1cGRhdGVkUHJvZmlsZXMiLCBmaWVsZHM6IFt1cGRhdGVkQnlJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgdXBkYXRlZEJ5SWQgICAgIFN0cmluZyAgIEBkYi5VdWlkCiAgZmlyc3ROYW1lICAgICAgIFN0cmluZwogIGxhc3ROYW1lICAgICAgICBTdHJpbmcKICBkaXNwbGF5TmFtZSAgICAgU3RyaW5nCiAgbWlkZGxlTmFtZSAgICAgIFN0cmluZz8KICBwcm9maWxlSW1hZ2VVcmwgU3RyaW5nPwogIGVtYWlsQWRkcmVzcyAgICBTdHJpbmcKICBwaG9uZU51bWJlciAgICAgU3RyaW5nPwogIGludHJvICAgICAgICAgICBTdHJpbmcKICB0YWdsaW5lICAgICAgICAgU3RyaW5nPwogIGdpdGh1YlVybCAgICAgICBTdHJpbmc/CiAgbGlua2VkaW5VcmwgICAgIFN0cmluZz8KfQo=",
  inlineSchemaHash: "545ee1f0d4f79c09541e95b64de94d6c1090dbb7d64f2b7054931f497541dc7f",
  noEngine: false,
};

const fs = require("fs");

config.dirname = __dirname;
if (!fs.existsSync(path.join(__dirname, "schema.prisma"))) {
  const alternativePaths = ["src/prisma/model/generated", "prisma/model/generated"];

  const alternativePath =
    alternativePaths.find(altPath => {
      return fs.existsSync(path.join(process.cwd(), altPath, "schema.prisma"));
    }) ?? alternativePaths[0];

  config.dirname = path.join(process.cwd(), alternativePath);
  config.isBundled = true;
}

config.runtimeDataModel = JSON.parse(
  '{"models":{"User":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"clerkId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"firstName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"lastName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"profileImageUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"emailAddress","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedSkills","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Skill","relationName":"updatedSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdSkills","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Skill","relationName":"createdSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedCompanies","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Company","relationName":"updatedCompanies","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdCompanies","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Company","relationName":"createdCompanies","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedExperiences","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Experience","relationName":"updatedExperiences","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdExperiences","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Experience","relationName":"createdExperiences","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedSchools","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"School","relationName":"updatedSchools","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdSchools","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"School","relationName":"createdSchools","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedEducations","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Education","relationName":"updatedEducations","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdEducations","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Education","relationName":"createdEducations","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedProfiles","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Profile","relationName":"updatedProfiles","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdProfiles","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Profile","relationName":"createdProfiles","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedDetails","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Detail","relationName":"updatedDetails","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdDetails","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Detail","relationName":"createdDetails","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedNestedDetails","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"NestedDetail","relationName":"updatedNestedDetails","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdNestedDetails","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"NestedDetail","relationName":"createdNestedDetails","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedCourses","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Course","relationName":"updatedCourses","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdCourses","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Course","relationName":"createdCourses","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedProjects","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","relationName":"updatedProjects","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdProjects","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","relationName":"createdProjects","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedRepositories","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Repository","relationName":"updatedRepositories","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdRepositories","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Repository","relationName":"createdRepositories","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedResumes","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Resume","relationName":"updatedResumes","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdResumes","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Resume","relationName":"createdResumes","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"NestedDetail":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdNestedDetails","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedNestedDetails","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"label","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"shortDescription","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"visible","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"detail","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Detail","relationName":"nestedDetails","relationFromFields":["detailId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"detailId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"project","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","relationName":"nestedDetails","relationFromFields":["projectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"projectId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"skills","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Skill","relationName":"nestedDetailSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["label","detailId"]],"uniqueIndexes":[{"name":null,"fields":["label","detailId"]}],"isGenerated":false},"Detail":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdDetails","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedDetails","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"entityId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"entityType","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DetailEntityType","isGenerated":false,"isUpdatedAt":false},{"name":"label","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"shortDescription","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"visible","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"nestedDetails","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"NestedDetail","relationName":"nestedDetails","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"project","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","relationName":"details","relationFromFields":["projectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"projectId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"skills","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Skill","relationName":"detailSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["label","entityId","entityType"]],"uniqueIndexes":[{"name":null,"fields":["label","entityId","entityType"]}],"isGenerated":false},"Resume":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdResumes","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedResumes","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"primary","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"downloadUrl","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"url","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"pathname","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"filename","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"size","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"BigInt","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Repository":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"slug","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdRepositories","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedRepositories","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"skills","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Skill","relationName":"skillRepositories","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"projects","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","relationName":"projectRepositories","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"visible","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"highlighted","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"startDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"npmPackageName","kind":"scalar","isList":false,"isRequired":false,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Skill":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"label","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"slug","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdSkills","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedSkills","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"experiences","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Experience","relationName":"experienceSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"educations","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Education","relationName":"educationSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"visible","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"categories","kind":"enum","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"SkillCategory","default":[],"isGenerated":false,"isUpdatedAt":false},{"name":"programmingLanguages","kind":"enum","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"ProgrammingLanguage","default":[],"isGenerated":false,"isUpdatedAt":false},{"name":"programmingDomains","kind":"enum","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"ProgrammingDomain","default":[],"isGenerated":false,"isUpdatedAt":false},{"name":"experience","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"calculatedExperience","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"includeInTopSkills","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"courses","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Course","relationName":"courseSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"projects","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","relationName":"projectSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"details","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Detail","relationName":"detailSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"nestedDetails","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"NestedDetail","relationName":"nestedDetailSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"repositories","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Repository","relationName":"skillRepositories","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Course":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"shortName","kind":"scalar","isList":false,"isRequired":false,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"slug","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdCourses","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedCourses","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"education","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Education","relationName":"courses","relationFromFields":["educationId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"educationId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"visible","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"skills","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Skill","relationName":"courseSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Project":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"shortName","kind":"scalar","isList":false,"isRequired":false,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"slug","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdProjects","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedProjects","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"startDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"skills","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Skill","relationName":"projectSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"details","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Detail","relationName":"details","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"nestedDetails","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"NestedDetail","relationName":"nestedDetails","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"repositories","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Repository","relationName":"projectRepositories","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"highlighted","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"visible","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Company":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdCompanies","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedCompanies","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"shortName","kind":"scalar","isList":false,"isRequired":false,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"logoImageUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"websiteUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"experiences","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Experience","relationName":"experiences","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"city","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"state","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"School":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdSchools","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedSchools","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"shortName","kind":"scalar","isList":false,"isRequired":false,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"logoImageUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"websiteUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"educations","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Education","relationName":"educations","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"city","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"state","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Experience":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdExperiences","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedExperiences","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"skills","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Skill","relationName":"experienceSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"startDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"endDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"company","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Company","relationName":"experiences","relationFromFields":["companyId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"companyId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"shortTitle","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"isRemote","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"visible","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"highlighted","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["title","companyId"]],"uniqueIndexes":[{"name":null,"fields":["title","companyId"]}],"isGenerated":false},"Education":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdEducations","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedEducations","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"skills","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Skill","relationName":"educationSkills","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"startDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"endDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"note","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"degree","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Degree","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"major","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"shortMajor","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"minor","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"concentration","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"school","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"School","relationName":"educations","relationFromFields":["schoolId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"schoolId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"postPoned","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"visible","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"highlighted","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"courses","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Course","relationName":"courses","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["major","schoolId"],["shortMajor","schoolId"]],"uniqueIndexes":[{"name":null,"fields":["major","schoolId"]},{"name":null,"fields":["shortMajor","schoolId"]}],"isGenerated":false},"Profile":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"uuid(4)","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"createdProfiles","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"updatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"updatedProfiles","relationFromFields":["updatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"updatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"firstName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"lastName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"displayName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"middleName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"profileImageUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"emailAddress","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"phoneNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"intro","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"tagline","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"githubUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"linkedinUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false}},"enums":{"DetailEntityType":{"values":[{"name":"EXPERIENCE","dbName":null},{"name":"EDUCATION","dbName":null}],"dbName":null},"SkillCategory":{"values":[{"name":"DEVOPS","dbName":null},{"name":"DATABASE","dbName":null},{"name":"API_DEVELOPMENT","dbName":null},{"name":"TESTING","dbName":null},{"name":"PROGRAMMING_LANGUAGE","dbName":null},{"name":"FRAMEWORK","dbName":null},{"name":"PACKAGE","dbName":null},{"name":"PACKAGE_MANAGER","dbName":null},{"name":"VERSION_MANAGER","dbName":null},{"name":"ORM","dbName":null},{"name":"WORKFLOW","dbName":null}],"dbName":null},"ProgrammingDomain":{"values":[{"name":"BACKEND","dbName":null},{"name":"FRONTEND","dbName":null},{"name":"MOBILE","dbName":null},{"name":"FULL_STACK","dbName":null}],"dbName":null},"ProgrammingLanguage":{"values":[{"name":"JAVASCRIPT","dbName":null},{"name":"TYPESCRIPT","dbName":null},{"name":"PYTHON","dbName":null},{"name":"SWIFT","dbName":null},{"name":"CSS","dbName":null},{"name":"SCSS","dbName":null},{"name":"CPLUSPLUS","dbName":null},{"name":"BASH","dbName":null},{"name":"JQUERY","dbName":null},{"name":"HTML","dbName":null},{"name":"MATLAB","dbName":null},{"name":"R","dbName":null}],"dbName":null},"Degree":{"values":[{"name":"BACHELORS_OF_SCIENCE","dbName":null},{"name":"MASTERS_OF_SCIENCE_IN_ENGINEERING","dbName":null},{"name":"MASTERS_OF_SCIENCE","dbName":null}],"dbName":null}},"types":{}}',
);
defineDmmfProperty(exports.Prisma, config.runtimeDataModel);
config.getQueryEngineWasmModule = undefined;

const { warnEnvConflicts } = require("./runtime/library");

warnEnvConflicts({
  rootEnvPath:
    config.relativeEnvPaths.rootEnvPath &&
    path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
  schemaEnvPath:
    config.relativeEnvPaths.schemaEnvPath &&
    path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath),
});

const PrismaClient = getPrismaClient(config);
exports.PrismaClient = PrismaClient;
Object.assign(exports, Prisma);

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-darwin-arm64.dylib.node");
path.join(process.cwd(), "src/prisma/model/generated/libquery_engine-darwin-arm64.dylib.node");
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/prisma/model/generated/schema.prisma");
