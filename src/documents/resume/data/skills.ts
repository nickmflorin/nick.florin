/**
 * Every sidebar section, keyed by name. `pages.ts` decides which sheet each one appears on, so
 * rebalancing the sidebar across sheets is a change there, not here.
 */
import { type SidebarSection } from './types';

export const LanguagesAndFrameworks: SidebarSection = {
  bars: [
    { level: 'expert', name: 'Python' },
    { level: 'expert', name: 'TypeScript' },
    { level: 'expert', name: 'JavaScript' },
    { level: 'expert', name: 'React' },
    { level: 'expert', name: 'Next.js' },
    { level: 'expert', name: 'Django / DRF' },
    { level: 'expert', name: 'Flask' },
    { level: 'advanced', name: 'Node.js' },
    { level: 'proficient', name: 'Express.js' },
    { level: 'advanced', name: 'GraphQL' },
    { level: 'advanced', name: 'Redux' },
    { level: 'advanced', name: 'TailwindCSS' },
    { level: 'advanced', name: 'Prisma' },
    { level: 'advanced', name: 'SASS / SCSS' },
    { level: 'proficient', name: 'Swift' },
    { level: 'familiar', name: 'Go' },
    { level: 'familiar', name: 'C++' },
  ],
  heading: 'Languages & Frameworks',
  kind: 'bars',
};

export const TopSkills: SidebarSection = {
  heading: 'Top Skills',
  kind: 'pills',
  pills: [
    'Python',
    'TypeScript',
    'React',
    'Django / DRF',
    'Next.js',
    'GraphQL',
    'Flask',
    'Node.js',
    'AWS',
    'PostgreSQL',
    'REST API Design',
    'SSR / RSC',
    'Microfrontends',
    'Testing (RTL, Jest, Playwright)',
    'Monorepo (Nx)',
    'Accessibility (axe-core)',
  ],
};

export const KeyStrengths: SidebarSection = {
  heading: 'Key Strengths',
  kind: 'pills',
  pills: [
    'Full-Stack Ownership',
    'Systems Architecture',
    'Performance Engineering',
    'Developer Experience',
    'Design / UX Partnership',
    'Engineering Leadership',
    'Cross-Functional Delivery',
  ],
};

export const CloudAndDatabases: SidebarSection = {
  bars: [
    { level: 'advanced', name: 'PostgreSQL' },
    { level: 'advanced', name: 'AWS' },
    { level: 'advanced', name: 'Docker' },
    { level: 'familiar', name: 'Redis' },
    { level: 'proficient', name: 'GCP' },
    { level: 'proficient', name: 'Vercel' },
    { level: 'familiar', name: 'NoSQL Databases' },
  ],
  heading: 'Cloud & Databases',
  kind: 'bars',
};

export const ArchitecturalPatterns: SidebarSection = {
  heading: 'Architectural Patterns',
  kind: 'pills',
  pills: [
    'Service-Oriented Arch',
    'Microservices',
    'Microfrontends',
    'Mesh-Style Architecture',
    'Monorepo (Nx, lerna)',
    'Server-Oriented Frontend',
    'SSR / RSC',
    'GraphQL Schema Design',
    'REST API Design',
    'Component Architecture',
    'Design Systems',
    'CI/CD Pipeline Design',
    'Event-Driven Architecture',
    'Bundle Analysis',
    'Performance Engineering',
    'Structured Logging',
    'Accessibility (WCAG)',
    'Observability',
  ],
};

export const UiAndComponentLibraries: SidebarSection = {
  heading: 'UI & Component Libraries',
  kind: 'pills',
  pills: ['MUI (Material UI)', 'Mantine', 'shadcn/ui', 'Styled Components', 'Emotion', 'Radix UI'],
};

export const Testing: SidebarSection = {
  heading: 'Testing',
  kind: 'pills',
  pills: [
    'Jest',
    'vitest',
    'React Testing Library',
    'Playwright',
    'Cypress',
    'pytest',
    'Storybook',
    'Visual Regression',
    'tox',
    'codecov',
    'Unit / Integration / E2E',
  ],
};

export const MonorepoAndBuild: SidebarSection = {
  heading: 'Monorepo & Build',
  kind: 'pills',
  pills: [
    'Nx',
    'Turborepo',
    'Lerna',
    'pnpm workspaces',
    'yarn workspaces',
    'Bundle Analyzer',
    'Tree-shaking',
    'Remote Build Caching',
    'Affected-task Pipelines',
  ],
};

export const CodeQualityAndDx: SidebarSection = {
  heading: 'Code Quality & DX',
  kind: 'pills',
  pills: [
    'ESLint',
    'Prettier',
    'Stylelint',
    'TypeScript Strict',
    'Zod',
    'mypy',
    'pylint',
    'flake8',
    'black',
    'Husky',
    'lint-staged',
    'Commitlint',
    'Dependabot',
    'Renovate',
  ],
};

export const AiToolingAndAutomation: SidebarSection = {
  heading: 'AI Tooling & Automation',
  kind: 'pills',
  pills: [
    'Claude Code',
    'Claude Design',
    'Cursor',
    'GitHub Copilot',
    'Agentic Workflows',
    'MCP Integrations',
    'AI Code Review Automation',
    'Context Engineering',
    'Custom Agents & Skills',
    'Agent Guardrails (ESLint, CI)',
    'Spec-Driven Development',
    'Prompt Engineering',
  ],
};

export const CicdAndAutomation: SidebarSection = {
  heading: 'CI/CD & Automation',
  kind: 'pills',
  pills: [
    'GitHub Actions',
    'CircleCI',
    'Jenkins',
    'Docker',
    'Reusable Workflows',
    'Poetry',
    'pnpm',
  ],
};
