/**
 * The competency catalog, one record per distinct label.
 *
 * The catalog is global and exhaustive: everything used, learned and worked with across the career
 * belongs here, independent of what any syndication channel renders. The resume references a
 * subset; a competency referenced nowhere is normal and expected, because the channels select from
 * the catalog rather than define it.
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

import { AllSyndicationChannels, type Competency, Proficiency, SyndicationChannel } from './types';

interface CompetencyOptions {
  readonly channels?: readonly SyndicationChannel[];
  readonly description?: string;
  readonly experience?: number;
  readonly isHighlighted?: boolean;
  readonly isPrioritized?: boolean;
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
 *
 * The `description`, `experience`, `isHighlighted` and `isPrioritized` values are carried over
 * from the legacy production `Skill` records by the legacy-data port (see the project's
 * `legacy-skill-mapping.md`); none of them render on the resume. Where several legacy skills fold
 * into one competency, flags are OR-ed and the largest experience wins.
 */
const competency = (label: string, options: CompetencyOptions = {}): Competency => ({
  calculatedExperience: null,
  channels: options.channels ?? [],
  description: options.description ?? null,
  experience: options.experience ?? null,
  isHighlighted: options.isHighlighted ?? false,
  isPrioritized: options.isPrioritized ?? false,
  isVisible: true,
  label,
  proficiency: options.proficiency ?? null,
  shortDescription: options.shortDescription ?? null,
  shortLabel: options.shortLabel ?? null,
  slug: slugify(label),
});

export const Accessibility = competency('Accessibility', {
  channels: AllSyndicationChannels,
});
export const AccessibilityAxeCore = competency('Accessibility (axe-core)', {
  channels: AllSyndicationChannels,
});
export const AccessibilityWCAG = competency('Accessibility (WCAG)', {
  channels: AllSyndicationChannels,
});
export const AffectedTaskPipelines = competency('Affected-task Pipelines', {
  channels: AllSyndicationChannels,
});
export const AgentGuardrailsESLintCI = competency('Agent Guardrails (ESLint, CI)', {
  channels: AllSyndicationChannels,
});
export const AgenticWorkflows = competency('Agentic Workflows', {
  channels: AllSyndicationChannels,
});
export const AICodeReviewAutomation = competency('AI Code Review Automation', {
  channels: AllSyndicationChannels,
});
export const Amplitude = competency('Amplitude', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const AntdAntDesign = competency('antd (Ant Design)', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  description: 'Third-party React component library developed by Ant Design.',
  isPrioritized: true,
});
export const ApolloServer = competency('Apollo Server', {
  channels: AllSyndicationChannels,
});
export const ApplicationSecurity = competency('Application Security', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Asyncio = competency('asyncio', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Auth0 = competency('Auth0', {
  channels: AllSyndicationChannels,
});
export const AuthenticationAuthorization = competency('Authentication & Authorization', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const AWS = competency('AWS', {
  channels: AllSyndicationChannels,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Advanced,
});
export const AWSCloudwatch = competency('AWS Cloudwatch', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const AWSDynamoDB = competency('AWS DynamoDB', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  isPrioritized: true,
});
export const AWSElasticBeanstalk = competency('AWS Elastic Beanstalk', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const AWSECS = competency('AWS ECS', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  description: 'AWS Elastic Container Service',
  isPrioritized: true,
});
export const AWSElastiCache = competency('AWS ElastiCache', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  isPrioritized: true,
});
export const AWSIAM = competency('AWS IAM', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  isPrioritized: true,
});
export const AWSLambda = competency('AWS Lambda', {
  channels: AllSyndicationChannels,
  experience: 1,
  proficiency: Proficiency.Familiar,
});
export const AWSEC2 = competency('AWS EC2', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const AWSRDS = competency('AWS RDS', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  description: 'AWS Relational Database Service',
  isPrioritized: true,
});
export const AWSS3 = competency('AWS S3', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Bash = competency('Bash', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  experience: 2,
  proficiency: Proficiency.Proficient,
});
export const Black = competency('black', {
  channels: AllSyndicationChannels,
});
export const BugSnag = competency('BugSnag', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const BundleAnalysis = competency('Bundle Analysis', {
  channels: AllSyndicationChannels,
});
export const Celery = competency('Celery', {
  channels: AllSyndicationChannels,
});
export const CiCdPipelineDesign = competency('CI/CD Pipeline Design', {
  channels: AllSyndicationChannels,
  shortLabel: 'CI/CD',
});
export const CircleCI = competency('CircleCI', {
  channels: AllSyndicationChannels,
});
export const ClaudeCode = competency('Claude Code', {
  channels: AllSyndicationChannels,
});
export const ClaudeDesign = competency('Claude Design', {
  channels: AllSyndicationChannels,
});
export const Clerk = competency('Clerk', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  experience: 2,
  proficiency: Proficiency.Proficient,
});
export const Codecov = competency('codecov', {
  channels: AllSyndicationChannels,
});
export const Commitlint = competency('Commitlint', {
  channels: AllSyndicationChannels,
});
export const ComponentArchitecture = competency('Component Architecture', {
  channels: AllSyndicationChannels,
  description: 'Component development in React.',
  isHighlighted: true,
  isPrioritized: true,
});
export const ContextEngineering = competency('Context Engineering', {
  channels: AllSyndicationChannels,
});
export const CPlusPlus = competency('C++', {
  channels: AllSyndicationChannels,
  experience: 2,
  proficiency: Proficiency.Familiar,
});
export const CreditDefaultRiskModeling = competency('Credit Default Risk Modeling', {
  channels: AllSyndicationChannels,
});
export const CrossFunctionalDelivery = competency('Cross-Functional Delivery', {
  channels: AllSyndicationChannels,
});
export const CSS = competency('CSS', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  experience: 10,
  isPrioritized: true,
  proficiency: Proficiency.Advanced,
});
export const Cursor = competency('Cursor', {
  channels: AllSyndicationChannels,
});
export const CustomAgentsSkills = competency('Custom Agents & Skills', {
  channels: AllSyndicationChannels,
});
export const Cypress = competency('Cypress', {
  channels: AllSyndicationChannels,
});
export const D3Js = competency('d3.js', {
  channels: AllSyndicationChannels,
  isHighlighted: true,
  isPrioritized: true,
});
export const Datadog = competency('Datadog', {
  channels: AllSyndicationChannels,
});
export const DataScraping = competency('Data Scraping', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const DataVisualization = competency('Data Visualization', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Dependabot = competency('Dependabot', {
  channels: AllSyndicationChannels,
});
export const DesignSystems = competency('Design Systems', {
  channels: AllSyndicationChannels,
});
export const DesignUXPartnership = competency('Design / UX Partnership', {
  channels: AllSyndicationChannels,
  isHighlighted: true,
  isPrioritized: true,
});
export const DeveloperExperience = competency('Developer Experience', {
  channels: AllSyndicationChannels,
});
export const Django = competency('Django', {
  channels: AllSyndicationChannels,
  experience: 10,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Expert,
});
export const DjangoChannels = competency('Django Channels', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const DjangoRESTFramework = competency('Django REST Framework', {
  channels: AllSyndicationChannels,
  experience: 8,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Expert,
  shortLabel: 'Django / DRF',
});
export const Docker = competency('Docker', {
  channels: AllSyndicationChannels,
  isPrioritized: true,
  proficiency: Proficiency.Advanced,
});
export const ElasticSearch = competency('ElasticSearch', {
  channels: AllSyndicationChannels,
});
export const Emotion = competency('Emotion', {
  channels: AllSyndicationChannels,
});
export const EngineeringLeadership = competency('Engineering Leadership', {
  channels: AllSyndicationChannels,
});
export const ESLint = competency('ESLint', {
  channels: AllSyndicationChannels,
});
export const EventDrivenArchitecture = competency('Event-Driven Architecture', {
  channels: AllSyndicationChannels,
});
export const ExpressJs = competency('Express.js', {
  channels: AllSyndicationChannels,
  proficiency: Proficiency.Proficient,
});
export const Firebase = competency('Firebase', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  description: 'A real-time, no-SQL database.',
});
export const Flake8 = competency('flake8', {
  channels: AllSyndicationChannels,
});
export const Flask = competency('Flask', {
  channels: AllSyndicationChannels,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Expert,
});
export const FloatingUI = competency('Floating UI', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  isPrioritized: true,
});
export const FramerMotion = competency('framer-motion', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  isPrioritized: true,
});
export const FullStackOwnership = competency('Full-Stack Ownership', {
  channels: AllSyndicationChannels,
});
export const GCP = competency('GCP', {
  channels: AllSyndicationChannels,
  description: 'Google Cloud Platform',
  experience: 2,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Proficient,
});
export const Git = competency('git', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const GitHubActions = competency('GitHub Actions', {
  channels: AllSyndicationChannels,
});
export const GitHubCopilot = competency('GitHub Copilot', {
  channels: AllSyndicationChannels,
});
export const Go = competency('Go', {
  channels: AllSyndicationChannels,
  proficiency: Proficiency.Familiar,
});
export const GraphQL = competency('GraphQL', {
  channels: AllSyndicationChannels,
  experience: 2,
  proficiency: Proficiency.Advanced,
});
export const GraphQLSchemaDesign = competency('GraphQL Schema Design', {
  channels: AllSyndicationChannels,
});
export const Handlebars = competency('Handlebars', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const HTML = competency('HTML', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Husky = competency('Husky', {
  channels: AllSyndicationChannels,
});
export const JavaScript = competency('JavaScript', {
  channels: AllSyndicationChannels,
  experience: 10,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Expert,
});
export const Jenkins = competency('Jenkins', {
  channels: AllSyndicationChannels,
});
export const Jest = competency('Jest', {
  channels: AllSyndicationChannels,
  isPrioritized: true,
});
export const Jinja = competency('Jinja', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const JQuery = competency('jQuery', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Lerna = competency('Lerna', {
  channels: AllSyndicationChannels,
});
export const LintStaged = competency('lint-staged', {
  channels: AllSyndicationChannels,
});
export const Mantine = competency('Mantine', {
  channels: AllSyndicationChannels,
  description: 'Third-party React component library.',
  isPrioritized: true,
});
export const Matlab = competency('Matlab', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  experience: 5,
  proficiency: Proficiency.Advanced,
});
export const MCPIntegrations = competency('MCP Integrations', {
  channels: AllSyndicationChannels,
});
export const MeshStyleArchitecture = competency('Mesh-Style Architecture', {
  channels: AllSyndicationChannels,
});
export const MeteorJS = competency('MeteorJS', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Microfrontends = competency('Microfrontends', {
  channels: AllSyndicationChannels,
});
export const Microservices = competency('Microservices', {
  channels: AllSyndicationChannels,
});
export const MongoDB = competency('MongoDB', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  isPrioritized: true,
});
export const MonorepoNx = competency('Monorepo (Nx)', {
  channels: AllSyndicationChannels,
  shortLabel: 'Nx',
});
export const MonteCarloMethods = competency('Monte Carlo Methods', {
  channels: AllSyndicationChannels,
});
export const MUIMaterialUI = competency('MUI (Material UI)', {
  channels: AllSyndicationChannels,
  description: 'Third-party React component library.',
  isPrioritized: true,
});
export const Mypy = competency('mypy', {
  channels: AllSyndicationChannels,
});
export const MySql = competency('mySQL', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const NextJs = competency('Next.js', {
  channels: AllSyndicationChannels,
  experience: 5,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Expert,
});
export const NodeJs = competency('Node.js', {
  channels: AllSyndicationChannels,
  experience: 7,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Advanced,
});
export const NoSQLDatabases = competency('NoSQL Databases', {
  channels: AllSyndicationChannels,
  proficiency: Proficiency.Familiar,
});
export const Npm = competency('npm', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const NumericalComputation = competency('Numerical Computation', {
  channels: AllSyndicationChannels,
});
export const Numpy = competency('numpy', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Nvm = competency('nvm', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Observability = competency('Observability', {
  channels: AllSyndicationChannels,
  isHighlighted: true,
  isPrioritized: true,
});
export const OptimizationMethods = competency('Optimization Methods', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const PackageDevelopment = competency('Package Development', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Pandas = competency('pandas', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const PerformanceEngineering = competency('Performance Engineering', {
  channels: AllSyndicationChannels,
});
export const Pino = competency('pino', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  description: 'Pino Logging Package',
});
export const Pip = competency('pip', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Playwright = competency('Playwright', {
  channels: AllSyndicationChannels,
});
export const PnpmWorkspaces = competency('pnpm workspaces', {
  channels: AllSyndicationChannels,
  shortLabel: 'pnpm',
});
export const Poetry = competency('Poetry', {
  channels: AllSyndicationChannels,
});
export const PostgreSQL = competency('PostgreSQL', {
  channels: AllSyndicationChannels,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Advanced,
});
export const Prettier = competency('Prettier', {
  channels: AllSyndicationChannels,
});
export const Prisma = competency('Prisma', {
  channels: AllSyndicationChannels,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Advanced,
});
export const PromptEngineering = competency('Prompt Engineering', {
  channels: AllSyndicationChannels,
});
export const Pyenv = competency('pyenv', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Pylint = competency('pylint', {
  channels: AllSyndicationChannels,
});
export const Pytest = competency('pytest', {
  channels: AllSyndicationChannels,
});
export const Python = competency('Python', {
  channels: AllSyndicationChannels,
  experience: 11,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Expert,
});
export const R = competency('R', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  experience: 2,
  proficiency: Proficiency.Familiar,
});
export const RabbitMQ = competency('RabbitMQ', {
  channels: AllSyndicationChannels,
});
export const RadixUI = competency('Radix UI', {
  channels: AllSyndicationChannels,
});
export const React = competency('React', {
  channels: AllSyndicationChannels,
  experience: 8,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Expert,
});
export const ReactNative = competency('React Native', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  experience: 2,
  isPrioritized: true,
  proficiency: Proficiency.Proficient,
});
export const ReactRedux = competency('React-Redux', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  isHighlighted: true,
  isPrioritized: true,
});
export const ReactTestingLibrary = competency('React Testing Library', {
  channels: AllSyndicationChannels,
});
export const Redis = competency('Redis', {
  channels: AllSyndicationChannels,
  proficiency: Proficiency.Familiar,
});
export const Redux = competency('Redux', {
  channels: AllSyndicationChannels,
  proficiency: Proficiency.Advanced,
});
export const ReduxSagas = competency('Redux-Sagas', {
  channels: AllSyndicationChannels,
  experience: 5,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Advanced,
});
export const RelationalDatabases = competency('Relational Databases', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  isHighlighted: true,
  isPrioritized: true,
});
export const RemoteBuildCaching = competency('Remote Build Caching', {
  channels: AllSyndicationChannels,
});
export const Renovate = competency('Renovate', {
  channels: AllSyndicationChannels,
});
export const ResponsiveDesign = competency('Responsive Design', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  experience: 8,
  proficiency: Proficiency.Advanced,
});
export const RESTAPIDesign = competency('REST API Design', {
  channels: AllSyndicationChannels,
  isPrioritized: true,
});
export const ReusableWorkflows = competency('Reusable Workflows', {
  channels: AllSyndicationChannels,
});
export const Rundeck = competency('Rundeck', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const SASS = competency('Sass', {
  channels: AllSyndicationChannels,
  experience: 5,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Advanced,
});
export const ScikitLearn = competency('scikit-learn', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Scipy = competency('scipy', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const Sentry = competency('Sentry', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const ServerOrientedFrontend = competency('Server-Oriented Frontend', {
  channels: AllSyndicationChannels,
});
export const ServiceOrientedArch = competency('Service-Oriented Arch', {
  channels: AllSyndicationChannels,
});
export const ShadcnUi = competency('shadcn/ui', {
  channels: AllSyndicationChannels,
});
export const SonarQube = competency('SonarQube', {
  channels: AllSyndicationChannels,
});
export const SpecDrivenDevelopment = competency('Spec-Driven Development', {
  channels: AllSyndicationChannels,
});
export const SQLAlchemy = competency('SQLAlchemy', {
  channels: AllSyndicationChannels,
});
export const SSR_RSC = competency('SSR / RSC', {
  channels: AllSyndicationChannels,
  isPrioritized: true,
  shortLabel: 'SSR',
});
export const Storybook = competency('Storybook', {
  channels: AllSyndicationChannels,
  isPrioritized: true,
});
export const StructuredLogging = competency('Structured Logging', {
  channels: AllSyndicationChannels,
});
export const StyledComponents = competency('Styled Components', {
  channels: AllSyndicationChannels,
  isPrioritized: true,
});
export const Stylelint = competency('Stylelint', {
  channels: AllSyndicationChannels,
});
export const Swift = competency('Swift', {
  channels: AllSyndicationChannels,
  experience: 2,
  isHighlighted: true,
  proficiency: Proficiency.Proficient,
});
export const SWR = competency('SWR', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  description: "Vercel's SWR Hook",
  isPrioritized: true,
});
export const SystemsArchitecture = competency('Systems Architecture', {
  channels: AllSyndicationChannels,
});
export const TailwindCSS = competency('TailwindCSS', {
  channels: AllSyndicationChannels,
  experience: 2,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Advanced,
});
export const TanStackQuery = competency('TanStack Query', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  description:
    'Powerful asynchronous state management for TS/JS, React, Solid, Vue, Svelte and Angular',
});
export const TestingRTLJestPlaywright = competency('Testing (RTL, Jest, Playwright)', {
  channels: AllSyndicationChannels,
});
export const Tox = competency('tox', {
  channels: AllSyndicationChannels,
});
export const TreeShaking = competency('Tree-shaking', {
  channels: AllSyndicationChannels,
});
export const TRPC = competency('TRPC', {
  channels: AllSyndicationChannels,
  isPrioritized: true,
});
export const Turborepo = competency('Turborepo', {
  channels: AllSyndicationChannels,
  description: "Vercel's TurboRepo for monolithic architectures.",
});
export const TypeScript = competency('TypeScript', {
  channels: AllSyndicationChannels,
  experience: 5,
  isHighlighted: true,
  isPrioritized: true,
  proficiency: Proficiency.Expert,
});
export const TypeScriptStrict = competency('TypeScript Strict', {
  channels: AllSyndicationChannels,
});
export const UnitIntegrationE2E = competency('Unit / Integration / E2E', {
  channels: AllSyndicationChannels,
  isPrioritized: true,
});
export const Vercel = competency('Vercel', {
  channels: AllSyndicationChannels,
  experience: 2,
  proficiency: Proficiency.Proficient,
});
export const VisualRegression = competency('Visual Regression', {
  channels: AllSyndicationChannels,
});
export const Vitest = competency('vitest', {
  channels: AllSyndicationChannels,
});
export const Vue = competency('Vue', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
  experience: 1,
  proficiency: Proficiency.Familiar,
});
export const WebSockets = competency('WebSockets', {
  channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
});
export const YarnWorkspaces = competency('yarn workspaces', {
  channels: AllSyndicationChannels,
});
export const Zod = competency('Zod', {
  channels: AllSyndicationChannels,
  description:
    "Zod is a TypeScript-first schema declaration and validation library. I'm using the term " +
    '"schema" to broadly refer to any data type, from a simple string to a complex nested object.',
  isPrioritized: true,
});
