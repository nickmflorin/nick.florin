/**
 * Every competency the resume references, one record per distinct label.
 *
 * These are module constants rather than inline literals because a competency is a row that belongs
 * to many parents at once: the same record is referenced from a role's chip list, from a content
 * node, and from a sidebar group. That shared identity is what becomes a join row when these move
 * to Prisma, so referencing the constant is how a many-to-many relation is expressed here.
 *
 * Several of these are the same competency under different labels. They are deliberately kept
 * separate for now so that the move to the new model renders identically to what it replaced;
 * merging them is tracked as a follow-up in the project backlog.
 */
import { slugify } from '../lib/slugs';

import { type Competency, Proficiency } from './types';

interface CompetencyOptions {
  readonly proficiency?: Proficiency;
  readonly shortDescription?: string;
  readonly shortLabel?: string;
}

/**
 * Builds a competency, defaulting everything the resume does not author.
 *
 * {@link Competency.proficiency} defaults to null: a level was only ever authored for the two dozen
 * competencies that appear as sidebar bars, and inventing one for the rest would be a claim the
 * data never made.
 */
const competency = (label: string, options: CompetencyOptions = {}): Competency => ({
  calculatedExperience: null,
  description: null,
  excludedChannels: [],
  experience: null,
  isHighlighted: false,
  isPrioritized: false,
  isVisible: true,
  label,
  proficiency: options.proficiency ?? null,
  shortDescription: options.shortDescription ?? null,
  shortLabel: options.shortLabel ?? null,
  slug: slugify(label),
});

export const Accessibility = competency('Accessibility');
export const AccessibilityAxeCore = competency('Accessibility (axe-core)');
export const AccessibilityWCAG = competency('Accessibility (WCAG)');
export const AffectedTaskPipelines = competency('Affected-task Pipelines');
export const AgentGuardrailsESLintCI = competency('Agent Guardrails (ESLint, CI)');
export const AgenticWorkflows = competency('Agentic Workflows');
export const AICodeReviewAutomation = competency('AI Code Review Automation');
export const ApolloServer = competency('Apollo Server');
export const Auth0 = competency('Auth0');
export const AWS = competency('AWS', {
  proficiency: Proficiency.Advanced,
});
export const AWSElasticBeanstalk = competency('AWS Elastic Beanstalk');
export const AWSLambda = competency('AWS Lambda');
export const AWSEC2 = competency('AWS EC2');
export const AWSS3 = competency('AWS S3');
export const Black = competency('black');
export const BundleAnalysis = competency('Bundle Analysis');
export const Celery = competency('Celery');
export const CiCdPipelineDesign = competency('CI/CD Pipeline Design', {
  shortLabel: 'CI/CD',
});
export const CircleCI = competency('CircleCI');
export const ClaudeCode = competency('Claude Code');
export const ClaudeDesign = competency('Claude Design');
export const Codecov = competency('codecov');
export const Commitlint = competency('Commitlint');
export const ComponentArchitecture = competency('Component Architecture');
export const ContextEngineering = competency('Context Engineering');
export const CPlusPlus = competency('C++', {
  proficiency: Proficiency.Familiar,
});
export const CreditDefaultRiskModeling = competency('Credit Default Risk Modeling');
export const CrossFunctionalDelivery = competency('Cross-Functional Delivery');
export const Cursor = competency('Cursor');
export const CustomAgentsSkills = competency('Custom Agents & Skills');
export const Cypress = competency('Cypress');
export const D3Js = competency('d3.js');
export const Datadog = competency('Datadog');
export const Dependabot = competency('Dependabot');
export const DesignSystems = competency('Design Systems');
export const DesignUXPartnership = competency('Design / UX Partnership');
export const DeveloperExperience = competency('Developer Experience');
export const Django = competency('Django');
export const DjangoChannels = competency('Django Channels');
export const DjangoRESTFramework = competency('Django REST Framework', {
  proficiency: Proficiency.Expert,
  shortLabel: 'Django / DRF',
});
export const Docker = competency('Docker', {
  proficiency: Proficiency.Advanced,
});
export const ElasticSearch = competency('ElasticSearch');
export const Emotion = competency('Emotion');
export const EngineeringLeadership = competency('Engineering Leadership');
export const ESLint = competency('ESLint');
export const EventDrivenArchitecture = competency('Event-Driven Architecture');
export const ExpressJs = competency('Express.js', {
  proficiency: Proficiency.Proficient,
});
export const Flake8 = competency('flake8');
export const Flask = competency('Flask', {
  proficiency: Proficiency.Expert,
});
export const FullStackOwnership = competency('Full-Stack Ownership');
export const GCP = competency('GCP', {
  proficiency: Proficiency.Proficient,
});
export const GitHubActions = competency('GitHub Actions');
export const GitHubCopilot = competency('GitHub Copilot');
export const Go = competency('Go', {
  proficiency: Proficiency.Familiar,
});
export const GraphQL = competency('GraphQL', {
  proficiency: Proficiency.Advanced,
});
export const GraphQLSchemaDesign = competency('GraphQL Schema Design');
export const Husky = competency('Husky');
export const JavaScript = competency('JavaScript', {
  proficiency: Proficiency.Expert,
});
export const Jenkins = competency('Jenkins');
export const Jest = competency('Jest');
export const Lerna = competency('Lerna');
export const LintStaged = competency('lint-staged');
export const Mantine = competency('Mantine');
export const MCPIntegrations = competency('MCP Integrations');
export const MeshStyleArchitecture = competency('Mesh-Style Architecture');
export const Microfrontends = competency('Microfrontends');
export const Microservices = competency('Microservices');
export const MongoDB = competency('MongoDB');
export const MonorepoNx = competency('Monorepo (Nx)', {
  shortLabel: 'Nx',
});
export const MonteCarloMethods = competency('Monte Carlo Methods');
export const MUIMaterialUI = competency('MUI (Material UI)');
export const Mypy = competency('mypy');
export const MySql = competency('mySQL');
export const NextJs = competency('Next.js', {
  proficiency: Proficiency.Expert,
});
export const NodeJs = competency('Node.js', {
  proficiency: Proficiency.Advanced,
});
export const NoSQLDatabases = competency('NoSQL Databases', {
  proficiency: Proficiency.Familiar,
});
export const NumericalComputation = competency('Numerical Computation');
export const Observability = competency('Observability');
export const Pandas = competency('pandas');
export const PerformanceEngineering = competency('Performance Engineering');
export const Playwright = competency('Playwright');
export const PnpmWorkspaces = competency('pnpm workspaces', {
  shortLabel: 'pnpm',
});
export const Poetry = competency('Poetry');
export const PostgreSQL = competency('PostgreSQL', {
  proficiency: Proficiency.Advanced,
});
export const Prettier = competency('Prettier');
export const Prisma = competency('Prisma', {
  proficiency: Proficiency.Advanced,
});
export const PromptEngineering = competency('Prompt Engineering');
export const Pylint = competency('pylint');
export const Pytest = competency('pytest');
export const Python = competency('Python', {
  proficiency: Proficiency.Expert,
});
export const RabbitMQ = competency('RabbitMQ');
export const RadixUI = competency('Radix UI');
export const React = competency('React', {
  proficiency: Proficiency.Expert,
});
export const ReactNative = competency('React Native');
export const ReactRedux = competency('React-Redux');
export const ReactTestingLibrary = competency('React Testing Library');
export const Redis = competency('Redis', {
  proficiency: Proficiency.Familiar,
});
export const Redux = competency('Redux', {
  proficiency: Proficiency.Advanced,
});
export const ReduxSagas = competency('Redux-Sagas');
export const RemoteBuildCaching = competency('Remote Build Caching');
export const Renovate = competency('Renovate');
export const ResponsiveDesign = competency('Responsive Design');
export const RESTAPIDesign = competency('REST API Design');
export const ReusableWorkflows = competency('Reusable Workflows');
export const SASS = competency('SASS / SCSS', {
  shortLabel: 'SASS',
});
export const ServerOrientedFrontend = competency('Server-Oriented Frontend');
export const ServiceOrientedArch = competency('Service-Oriented Arch');
export const ShadcnUi = competency('shadcn/ui');
export const SonarQube = competency('SonarQube');
export const SpecDrivenDevelopment = competency('Spec-Driven Development');
export const SQLAlchemy = competency('SQLAlchemy');
export const SSR_RSC = competency('SSR / RSC', {
  shortLabel: 'SSR',
});
export const Storybook = competency('Storybook');
export const StructuredLogging = competency('Structured Logging');
export const StyledComponents = competency('Styled Components');
export const Stylelint = competency('Stylelint');
export const Swift = competency('Swift', {
  proficiency: Proficiency.Proficient,
});
export const SystemsArchitecture = competency('Systems Architecture');
export const TailwindCSS = competency('TailwindCSS', {
  proficiency: Proficiency.Advanced,
});
export const TestingRTLJestPlaywright = competency('Testing (RTL, Jest, Playwright)');
export const Tox = competency('tox');
export const TreeShaking = competency('Tree-shaking');
export const TRPC = competency('TRPC');
export const Turborepo = competency('Turborepo');
export const TypeScript = competency('TypeScript', {
  proficiency: Proficiency.Expert,
});
export const TypeScriptStrict = competency('TypeScript Strict');
export const UnitIntegrationE2E = competency('Unit / Integration / E2E');
export const Vercel = competency('Vercel', {
  proficiency: Proficiency.Proficient,
});
export const VisualRegression = competency('Visual Regression');
export const Vitest = competency('vitest');
export const WebSockets = competency('WebSockets');
export const YarnWorkspaces = competency('yarn workspaces');
export const Zod = competency('Zod');
