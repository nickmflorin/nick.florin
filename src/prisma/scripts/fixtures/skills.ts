import fs from "fs";

import { ProgrammingLanguage, SkillCategory, ProgrammingDomain } from "../../model";

import { getJsonFixtureFilePath } from "./constants";
import { type JsonSkill } from "./schemas";

const PROGRAMMING_LANGUAGES: JsonSkill[] = [
  {
    label: "TypeScript",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT],
    programmingDomains: [ProgrammingDomain.FULL_STACK],
    experience: 5,
    includeInTopSkills: true,
  },
  {
    label: "Swift",
    programmingDomains: [ProgrammingDomain.MOBILE],
    programmingLanguages: [ProgrammingLanguage.SWIFT],
    experience: 2,
    includeInTopSkills: false,
  },
  {
    label: "C++",
    slug: "c-plus-plus",
    programmingDomains: [ProgrammingDomain.BACKEND],
    programmingLanguages: [ProgrammingLanguage.CPLUSPLUS],
    experience: 2,
    includeInTopSkills: false,
  },
  {
    label: "Javascript",
    programmingLanguages: [ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.FULL_STACK],
    experience: 9,
    includeInTopSkills: true,
  },
  {
    label: "Python",
    programmingDomains: [ProgrammingDomain.BACKEND],
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    experience: 11,
    includeInTopSkills: true,
  },
  {
    label: "SCSS & SASS",
    slug: "sass",
    programmingLanguages: [ProgrammingLanguage.SCSS],
    programmingDomains: [ProgrammingDomain.FRONTEND],
    experience: 5,
  },
  {
    label: "Matlab",
    programmingLanguages: [ProgrammingLanguage.MATLAB],
    includeInTopSkills: false,
    experience: 5,
  },
  {
    label: "bash",
    includeInTopSkills: false,
    experience: 2,
    programmingLanguages: [ProgrammingLanguage.BASH],
  },
  {
    label: "CSS",
    experience: 11,
    programmingLanguages: [ProgrammingLanguage.CSS],
    includeInTopSkills: false,
  },
  {
    label: "R",
    experience: 2,
    programmingLanguages: [ProgrammingLanguage.R],
    includeInTopSkills: false,
  },
  {
    label: "jQuery",
    programmingLanguages: [ProgrammingLanguage.JQUERY, ProgrammingLanguage.JAVASCRIPT],
    includeInTopSkills: false,
  },
  {
    label: "HTML",
    programmingLanguages: [ProgrammingLanguage.HTML],
    includeInTopSkills: false,
  },
];

const FRAMEWORKS: JsonSkill[] = [
  {
    label: "NextJS",
    programmingDomains: [ProgrammingDomain.FULL_STACK],
    programmingLanguages: [
      ProgrammingLanguage.TYPESCRIPT,
      ProgrammingLanguage.JAVASCRIPT,
      ProgrammingLanguage.CSS,
      ProgrammingLanguage.SCSS,
    ],
    includeInTopSkills: true,
    experience: 4,
  },
  {
    label: "GraphQL",
    categories: [SkillCategory.API_DEVELOPMENT],
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.FULL_STACK],
    includeInTopSkills: true,
    experience: 2,
  },
  {
    label: "React",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.FRONTEND],
    includeInTopSkills: true,
    experience: 8,
  },
  {
    label: "TRPC",
    categories: [SkillCategory.API_DEVELOPMENT],
    programmingDomains: [ProgrammingDomain.FULL_STACK],
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    includeInTopSkills: false,
  },
  {
    label: "nodeJS",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.BACKEND],
    includeInTopSkills: true,
    experience: 7,
  },
  {
    label: "Django REST Framework",
    categories: [SkillCategory.API_DEVELOPMENT],
    programmingDomains: [ProgrammingDomain.BACKEND],
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    includeInTopSkills: true,
    experience: 8,
  },
  {
    label: "Flask",
    includeInTopSkills: true,
    categories: [SkillCategory.API_DEVELOPMENT],
    programmingDomains: [ProgrammingDomain.BACKEND],
    programmingLanguages: [ProgrammingLanguage.PYTHON],
  },
  {
    label: "Django",
    includeInTopSkills: true,
    programmingDomains: [ProgrammingDomain.FULL_STACK],
    programmingLanguages: [ProgrammingLanguage.PYTHON],
  },
  {
    label: "TailwindCSS",
    includeInTopSkills: true,
    programmingLanguages: [ProgrammingLanguage.SCSS, ProgrammingLanguage.CSS],
    programmingDomains: [ProgrammingDomain.FRONTEND],
  },
  {
    label: "SCSS/CSS Modules",
    programmingDomains: [ProgrammingDomain.FRONTEND],
    programmingLanguages: [ProgrammingLanguage.SCSS, ProgrammingLanguage.CSS],
    includeInTopSkills: false,
  },
  {
    label: "React Native",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.MOBILE],
    experience: 2,
    includeInTopSkills: false,
  },
  {
    label: "MeteorJS",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.FULL_STACK],
    includeInTopSkills: false,
  },
];

const PACKAGE_MANAGERS: JsonSkill[] = [
  {
    label: "pnpm",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
  },
  {
    label: "npm",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
  },
  {
    label: "yarn",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
  },
  {
    label: "pip",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
  },
  {
    label: "poetry",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
  },
];

const VERSION_MANAGERS: JsonSkill[] = [
  {
    label: "nvm",
  },
  {
    label: "pyenv",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
  },
];

const TESTING: JsonSkill[] = [
  {
    label: "tox",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    categories: [SkillCategory.PACKAGE],
  },
  { label: "codecov" },
  {
    label: "pytest",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    categories: [SkillCategory.PACKAGE],
  },
  {
    label: "unittest",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    categories: [SkillCategory.PACKAGE],
  },
  {
    label: "mock",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    categories: [SkillCategory.PACKAGE],
  },
  {
    label: "jest",
    slug: "jest",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    categories: [SkillCategory.PACKAGE],
  },
  { label: "Unit Testing" },
  { label: "Integration Testing" },
];

const ORMS: JsonSkill[] = [
  {
    label: "PrismaJS",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    includeInTopSkills: true,
  },
  {
    label: "SQLAlchemy",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    includeInTopSkills: false,
  },
  {
    label: "mongooseJS",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    includeInTopSkills: false,
  },
];

const PACKAGES: JsonSkill[] = [
  {
    label: "Floating UI",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.FRONTEND],
  },
  {
    label: "StorybookJS",
    slug: "storybookjs",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.FRONTEND],
  },
  {
    label: "React Redux",
    slug: "react-redux",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.FRONTEND],
    includeInTopSkills: true,
  },
  {
    label: "Redux-Sagas",
    slug: "redux-sagas",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.FRONTEND],
    includeInTopSkills: true,
  },
  {
    label: "celery",
    slug: "celery",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "Django Channels",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "flake8",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "pylint",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "numpy",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "scipy",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "scikit-learn",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "black",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "asyncio",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "expressJS",
    programmingDomains: [ProgrammingDomain.BACKEND],
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
  },
  {
    label: "pandas",
    programmingLanguages: [ProgrammingLanguage.PYTHON],
    programmingDomains: [ProgrammingDomain.BACKEND],
  },
  {
    label: "d3.js",
    slug: "d3js",
    programmingLanguages: [ProgrammingLanguage.TYPESCRIPT, ProgrammingLanguage.JAVASCRIPT],
    programmingDomains: [ProgrammingDomain.FRONTEND],
    includeInTopSkills: true,
  },
];

const WORKFLOWS: JsonSkill[] = [
  { label: "Agile Software Development" },
  { label: "Project Planning & Roadmapping" },
  { label: "git", slug: "git" },
  { label: "Jira" },
  { label: "Notion" },
  { label: "Clubhouse" },
  { label: "ClickUp" },
];

export const json: JsonSkill[] = [
  ...PROGRAMMING_LANGUAGES.map(skill => ({
    includeInTopSkills: true,
    ...skill,
    categories: [...(skill.categories || []), SkillCategory.PROGRAMMING_LANGUAGE],
  })),
  ...FRAMEWORKS.map(skill => ({
    includeInTopSkills: true,
    ...skill,
    categories: [...(skill.categories || []), SkillCategory.FRAMEWORK, SkillCategory.PACKAGE],
  })),
  ...PACKAGE_MANAGERS.map(skill => ({
    includeInTopSkills: false,
    ...skill,
    categories: [...(skill.categories || []), SkillCategory.PACKAGE_MANAGER],
  })),
  ...VERSION_MANAGERS.map(skill => ({
    includeInTopSkills: false,
    ...skill,
    categories: [...(skill.categories || []), SkillCategory.VERSION_MANAGER],
  })),
  ...TESTING.map(skill => ({
    includeInTopSkills: true,
    ...skill,
    categories: [...(skill.categories || []), SkillCategory.TESTING],
  })),
  ...ORMS.map(skill => ({
    includeInTopSkills: true,
    ...skill,
    categories: [
      ...(skill.categories || []),
      SkillCategory.ORM,
      SkillCategory.PACKAGE,
      SkillCategory.DATABASE,
    ],
    programmingDomains: [...(skill.programmingDomains || []), ProgrammingDomain.BACKEND],
  })),
  ...PACKAGES.map(skill => ({
    includeInTopSkills: false,
    ...skill,
    categories: [...(skill.categories || []), SkillCategory.PACKAGE],
  })),
  ...WORKFLOWS.map(skill => ({
    includeInTopSkills: false,
    ...skill,
    categories: [...(skill.categories || []), SkillCategory.WORKFLOW],
  })),
  { label: "Vercel", categories: [SkillCategory.DEVOPS] },
  { label: "SSR" },
  { label: "docker", includeInTopSkills: true },
  { label: "Jenkins" },
  { label: "SonarQube" },
  { label: "PostgreSQL", includeInTopSkills: true },
  { label: "Security Practices" },
  { label: "CI/CD", categories: [SkillCategory.DEVOPS] },
  { label: "AWS S3 Storage" },
  { label: "CircleCI" },
  { label: "Redis" },
  { label: "JWT Authentication" },
  { label: "AWS EC2" },
  { label: "AWS", includeInTopSkills: true },
  { label: "AWS Cloudwatch" },
  { label: "Auth0" },
  { label: "Clerk" },
  { label: "Application Security" },
  { label: "Web Sockets" },
  { label: "Data Scraping" },
  { label: "Django Admin" },
  { label: "Microservices Architecture" },
  { label: "Rundeck" },
  { label: "linux" },
  { label: "ElasticSearch" },
  { label: "Session Authentication" },
  { label: "RabbitMQ" },
  { label: "Message Buses" },
  { label: "Python 2/3 Compatibility", slug: "python-23-compatibility" },
  { label: "Package & Dependency Management" },
  { label: "Relational Databases" },
  { label: "REST API Design", categories: [SkillCategory.API_DEVELOPMENT] },
  { label: "mySQL" },
  { label: "Jinja" },
  { label: "Sentry" },
  { label: "Amplitude" },
  { label: "BugSnag" },
  { label: "HTML Templating" },
  { label: "Authentication Protocols" },
  { label: "AWS Elastic Beanstalk" },
  { label: "noSQL Databases" },
  { label: "mongoDB" },
  { label: "AWS Lambdas" },
  { label: "Handlebars" },
  { label: "Numerical Computation" },
];

export const jsonfiy = () => {
  const filename = getJsonFixtureFilePath("skills");
  fs.writeFile(filename, JSON.stringify({ skills: json }), "utf8", err => {
    if (err) {
      /* eslint-disable-next-line no-console */
      console.error(`There was an error writing the fixtures to file ${filename}: \n${err}`);
    } else {
      /* eslint-disable-next-line no-console */
      console.info(`Successfully saved skills fixtures to file ${filename}.`);
    }
  });
};
