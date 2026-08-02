import { enumeratedLiterals } from 'enumerated-literals';

import { ProgrammingDomain, ProgrammingLanguage, SkillCategory } from './prisma-client';

export const ProgrammingLanguages = enumeratedLiterals(
  [
    { icon: '/programming-languages/bash.svg', label: 'Bash', value: ProgrammingLanguage.BASH },
    {
      icon: '/programming-languages/cplusplus.svg',
      label: 'C++',
      value: ProgrammingLanguage.CPLUSPLUS,
    },
    { icon: '/programming-languages/css.svg', label: 'CSS', value: ProgrammingLanguage.CSS },
    {
      icon: '/programming-languages/python.svg',
      label: 'Python',
      value: ProgrammingLanguage.PYTHON,
    },
    {
      icon: '/programming-languages/sass.svg',
      label: 'SASS/SCSS',
      value: ProgrammingLanguage.SCSS,
    },
    {
      icon: '/programming-languages/javascript.svg',
      label: 'JavaScript',
      value: ProgrammingLanguage.JAVASCRIPT,
    },
    {
      icon: '/programming-languages/typescript.svg',
      label: 'TypeScript',
      value: ProgrammingLanguage.TYPESCRIPT,
    },
    {
      icon: '/programming-languages/jquery.svg',
      label: 'jQuery',
      value: ProgrammingLanguage.JQUERY,
    },
    { icon: '/programming-languages/swift.svg', label: 'Swift', value: ProgrammingLanguage.SWIFT },
    {
      icon: '/programming-languages/matlab.svg',
      label: 'Matlab',
      value: ProgrammingLanguage.MATLAB,
    },
    { icon: '/programming-languages/html.svg', label: 'HTML', value: ProgrammingLanguage.HTML },
    { icon: '/programming-languages/r.svg', label: 'R', value: ProgrammingLanguage.R },
    { icon: '/programming-languages/vba.svg', label: 'VBA', value: ProgrammingLanguage.VBA },
    { icon: '/programming-languages/react.svg', label: 'React', value: ProgrammingLanguage.REACT },
  ] as const satisfies {
    icon: `/programming-languages/${string}.svg` | null;
    label: string;
    value: ProgrammingLanguage;
  }[],
  {},
);

export const SkillCategories = enumeratedLiterals(
  [
    { label: 'API Development', value: SkillCategory.API_DEVELOPMENT },
    { label: 'Database', value: SkillCategory.DATABASE },
    { label: 'Dev Ops', value: SkillCategory.DEVOPS },
    { label: 'Framework', value: SkillCategory.FRAMEWORK },
    { label: 'ORM', value: SkillCategory.ORM },
    { label: 'Package', value: SkillCategory.PACKAGE },
    { label: 'Package Manager', value: SkillCategory.PACKAGE_MANAGER },
    { label: 'Programming Language', value: SkillCategory.PROGRAMMING_LANGUAGE },
    { label: 'Testing', value: SkillCategory.TESTING },
    { label: 'Version Manager', value: SkillCategory.VERSION_MANAGER },
    { label: 'Workflow', value: SkillCategory.WORKFLOW },
    { label: 'Academic', value: SkillCategory.ACADEMIC },
    { label: 'Logging, Monitoring & Alerting', value: SkillCategory.LOGGING_ALERTING_MONITORING },
  ] as const satisfies { label: string; value: SkillCategory }[],
  {},
);

export const ProgrammingDomains = enumeratedLiterals(
  [
    { label: 'Backend', value: ProgrammingDomain.BACKEND },
    { label: 'Frontend', value: ProgrammingDomain.FRONTEND },
    { label: 'Full Stack', value: ProgrammingDomain.FULL_STACK },
    { label: 'Mobile', value: ProgrammingDomain.MOBILE },
    { label: 'Infrastructure', value: ProgrammingDomain.INFRASTRUCTURE },
  ] as const satisfies { label: string; value: ProgrammingDomain }[],
  {},
);
