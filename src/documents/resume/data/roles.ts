/* eslint-disable max-lines -- This is temporary. */
import {
  Corsha,
  CraftEducationSystem,
  GreenBudget,
  NirvedaCognition,
  Northbeam,
  PIAnalytics,
  SaracenEnergy,
  ShelfCycle,
  TheAtlantic,
  TheRockCreekGroup,
  USLegeAI,
} from './companies';
import {
  Accessibility,
  AccessibilityAxeCore,
  Amplitude,
  AntdAntDesign,
  ApolloServer,
  ApplicationSecurity,
  Asyncio,
  Auth0,
  AuthenticationAuthorization,
  AWS,
  AWSCloudwatch,
  AWSDynamoDB,
  AWSEC2,
  AWSECS,
  AWSElastiCache,
  AWSElasticBeanstalk,
  AWSIAM,
  AWSLambda,
  AWSRDS,
  AWSS3,
  Bash,
  Black,
  BugSnag,
  Celery,
  CiCdPipelineDesign,
  CircleCI,
  Clerk,
  Codecov,
  ComponentArchitecture,
  CreditDefaultRiskModeling,
  CSS,
  D3Js,
  Datadog,
  DataScraping,
  DesignUXPartnership,
  Django,
  DjangoChannels,
  DjangoRESTFramework,
  Docker,
  ElasticSearch,
  EngineeringLeadership,
  ESLint,
  EventDrivenArchitecture,
  ExpressJs,
  Flake8,
  Flask,
  FloatingUI,
  FramerMotion,
  GCP,
  Git,
  GitHubActions,
  GraphQL,
  Handlebars,
  HTML,
  JavaScript,
  Jenkins,
  Jest,
  Jinja,
  JQuery,
  Lerna,
  Mantine,
  MeteorJS,
  Microfrontends,
  Microservices,
  MongoDB,
  MonorepoNx,
  MonteCarloMethods,
  MUIMaterialUI,
  MySql,
  NextJs,
  NodeJs,
  NoSQLDatabases,
  Npm,
  NumericalComputation,
  Numpy,
  Nvm,
  Observability,
  PackageDevelopment,
  Pandas,
  PerformanceEngineering,
  Pino,
  Pip,
  Playwright,
  PnpmWorkspaces,
  Poetry,
  PostgreSQL,
  Prettier,
  Prisma,
  Pyenv,
  Pylint,
  Pytest,
  Python,
  R,
  RabbitMQ,
  React,
  ReactNative,
  ReactRedux,
  Redis,
  ReduxSagas,
  RelationalDatabases,
  ResponsiveDesign,
  RESTAPIDesign,
  Rundeck,
  SASS,
  ScikitLearn,
  Scipy,
  Sentry,
  SonarQube,
  SQLAlchemy,
  SSR_RSC,
  Storybook,
  StyledComponents,
  SWR,
  SystemsArchitecture,
  TailwindCSS,
  TanStackQuery,
  Tox,
  TRPC,
  Turborepo,
  TypeScript,
  UnitIntegrationE2E,
  Vercel,
  Vue,
  WebSockets,
  YarnWorkspaces,
  Zod,
} from './competencies';
import { AllSyndicationChannels, NodeType, type RoleInput, SyndicationChannel } from './types';

/**
 * Every role, newest first. Which sheet a role lands on is decided in `pages.ts`, not here, so
 * reordering or rebalancing pages never touches this file.
 *
 * Each role's prose is a content tree: `summary` is the opening paragraphs, one node each, and
 * `content` is the titled sections beneath them. A section with `children` renders as a list, and
 * each child's `title` becomes its bold lead-in — the layout is derived from the parent's type, so
 * `titleLayout` is never set by hand. `skills` is the chip row at the bottom of the role.
 *
 * Each tree states its channels at the root and nodes inherit them; a node authors `channels`
 * only to narrow the set (e.g. a website-only bullet). See the `resume-gen` repository's
 * `docs/content-model.md`.
 */
export const Roles: RoleInput[] = [
  {
    city: null,
    company: CraftEducationSystem,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        TypeScript,
        React,
        NextJs,
        GraphQL,
        ApolloServer,
        Prisma,
        PostgreSQL,
        MonorepoNx,
        Microfrontends,
        SSR_RSC,
        PerformanceEngineering,
        AccessibilityAxeCore,
        Datadog,
        Playwright,
        GitHubActions,
        AWS,
      ],
      content: [
        {
          children: [
            {
              content: `Tenant-aware membership and access-control system gating content,
               assessments, and activity visibility across nested customer cohorts. Drove the
               architectural call: landed on policy-based authorization with hierarchical permission
               scoping and modeled cohort membership as a composable relationship graph - enabling
               nested inheritance and cross-organizational sharing.`,
              title: 'Segmented Learner Cohorts',
            },
            {
              content: `Grading surface for instructors, evaluators, and admins to design, attach,
               and score configurable rubrics; now the most-used feature in the product. Led the
               redesign after the original implementation accumulated unfixable state-management
               bugs - aligning product, design, and engineering on a four-mode provider pattern
               (view/edit/attach/score) and a schema-driven form architecture unifying every surface
               behind one rendering pipeline.`,
              title: 'Rubrics',
            },
            {
              channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
              content: `Activity-logging and approval workflow for learners, instructors,
               evaluators, and admins, with program-specific validation and submit-on-behalf-of
               flows. Kept it extensible without per-customer forks: modeled approval as a state
               machine with pluggable rules. Exposed program-level configuration so instructors and
               admins could tailor how learners tracked time - daily vs. monthly entry cadence,
               minimum time per activity, whether learners could log above the target, and other
               per-program constraints - without requiring engineering changes.`,
              title: 'Time Tracking',
            },
            {
              channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
              content: `New product surface for defining skill taxonomies, attaching them to
               activities, and tracking learner progress. Led end-to-end from discovery through
               rollout: authored the taxonomy and progress-aggregation data model, and drew the
               platform/per-customer boundary so the feature could be reused across future products
               on the monorepo. Organized and planned the work based on dependencies to maximize
               parallel efforts across multiple engineers.`,
              title: 'Skills Tracking',
            },
          ],
          content: `Led a cross-functional pod from the ground up, starting as a 2-engineer team
           alongside a PM and rotating designer, then expanding into a 5-engineer pod with a
           dedicated PM. Served as Engineering Lead throughout, owning feature scoping, technical
           planning, sprint execution, and delivery end-to-end.`,
          title: 'Leadership',
          type: NodeType.NumberedList,
        },
        {
          children: [
            {
              content: `Owned the platform upgrade that had stalled repeatedly: a legacy,
               client-bound Auth0 integration pinned the app to React 18 and blocked the Next.js
               upgrade path entirely. Re-architected authentication around edge middleware and
               server-side session management on Auth0 v4, then landed Auth0 v4, Next.js 16, React
               19, and Turbopack as a coordinated three-stage rollout - a net deletion of code -
               with zero customer-facing downtime.`,
              title: 'Auth0 v4 &amp; Next.js 16 Replatform',
            },
            {
              content: `Led a sustained, incremental migration - building team buy-in and driving a
               rethinking of the app's client/server boundaries over many months - to dismantle the
               client-side waterfall behind every cold page load: a ~1 MB bundle download followed
               by serial session, user, environment, and feature-flag requests that produced 3-4
               seconds of blank screen before first paint and defeated Next.js page caching
               entirely. Progressively moved session validation into edge middleware, feature-flag
               evaluation to server startup, and provider bootstrapping onto the server - so pages
               fully pre-render, previously-visited pages return near-instantly from the restored
               page cache, and the app's third-party browser exposure collapses to a single
               first-party origin, eliminating a class of customer-firewall outages.`,
              title: 'Server-Oriented Frontend Migration',
            },
            {
              content: `Diagnosed the root causes behind a bloated shared bundle - barrel-export
               fan-out, a 525 kB generated GraphQL document, a non-lazy provider cascade, and a UI
               package exports map silently pointing to CJS output that defeated tree-shaking -
               then authored the remediation roadmap and led its incremental delivery across the
               team over successive releases, cutting the app-wide first-load JavaScript baseline
               62% (1.01 MB to 383 kB) and the shared app chunk 68% (921 kB to under 300 kB).`,
              title: 'Bundle Size &amp; First Load Performance',
            },
            {
              content: `Combined, the architectural unlock and bundle work improved FCP/LCP ~50%
               and TTI ~60% on high-traffic pages and cut cold-load times by 2-4 seconds on slower
               and corporate-throttled networks; non-critical client work (session replay,
               analytics boot, background refreshes) now defers until the browser is idle, keeping
               the main thread free for first paint.`,
              title: 'Core Web Vitals &amp; Loading Performance',
            },
            {
              content: `Co-architected the company's embedded-analytics integration (ThoughtSpot)
               around a deliberate licensing constraint: rather than provisioning per-user service
               accounts, all reporting is served through one service account with requests proxied
               through the app - saving the company roughly $50k per year. Uncovered the critical
               report-loading bottlenecks that were overwhelming the client and freezing browsers,
               then designed and implemented the remedy - per-user liveboard preloading under the
               shared account plus streamed, cached proxy assets - making report loads
               near-instantaneous.`,
              title: 'Embedded Analytics Proxy &amp; Report Performance',
            },
            {
              content: `Championed and led a long-term restructuring of the platform around
               scalable monorepo patterns: spearheaded Nx adoption, reoriented engineering efforts
               toward decoupled, independently-owned modules with clean microfrontend boundaries,
               and steered the company's expansion from a single-product codebase toward a
               scalable, multi-product mesh.`,
              title: 'Monorepo &amp; Microfrontend Decoupling',
            },
            {
              channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
              content: `Designed and rolled out a unified, namespaced structured-logging
               architecture spanning every service - replacing scattered ad-hoc logging with a
               single queryable observability surface wired into Datadog.`,
              title: 'Structured Logging &amp; Observability',
            },
          ],
          title: 'Architecture',
          type: NodeType.NumberedList,
        },
        {
          content: `Invested heavily in the growth of junior and mid-level engineers through
           structured PR reviews, pair programming, and 1:1 mentoring focused on TypeScript, React,
           Next.js, and GraphQL. Acted as a consistent technical resource and escalation point for
           the broader engineering organization.`,
          title: 'Mentoring',
        },
        {
          content: `Primary liaison between Design/UX and Engineering; established structured
           handoff and feedback processes that reduced ambiguity, shortened iteration cycles, and
           produced measurably better user experiences. Spearheaded integration of Deque axe-core
           accessibility checks into CI/CD pipelines for automated WCAG enforcement.`,
          title: 'Design &amp; UX Coordination',
        },
        {
          channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
          content: `Established a monorepo-wide TypeScript and ESLint quality program,
           systematically adopting 20+ rules via a grandfathering strategy that kept new code clean
           while enabling incremental migration. Enforced type-checking across test files in CI,
           fixed long-broken IDE ESLint integration, and created an internal documentation app
           covering contributing guides, React patterns, and architectural decisions.`,
          title: 'Developer Experience &amp; Code Quality',
        },
      ],
      summary: [
        {
          content: `Engineering Lead of a cross-functional product pod, responsible for leading the
           development of large, customer-facing features. Played a central role in the company's
           architectural evolution following its acquisition by WGU (Western Governors University),
           driving the transition from a single-product engineering organization - operating out of
           one product codebase - to an enterprise-grade, multi-product platform organized as a
           unified monorepo. Championed the underlying monorepo strategy and Nx adoption as the
           structural foundation for that transition, establishing shared tooling, independent
           product surfaces, and scalable team ownership within one cohesive engineering platform.`,
        },
        {
          content: `Most recently, drove the platform's most consequential frontend effort since
           the monorepo: a coordinated Auth0 v4, Next.js 16, and React 19 replatform paired with a
           months-long performance program that unwound a client-bound rendering architecture and
           restored server-side rendering, page caching, and healthy Core Web Vitals across the
           product.`,
        },
        {
          content: `Operated consistently above title - writing code, authoring architectural specs,
           producing technical analyses, and unblocking teammates across the engineering
           organization.`,
        },
        {
          content: `The pod's output was directly instrumental in attracting and onboarding new
           enterprise accounts and qualifying the company for several public-sector grants.`,
        },
      ],
    },
    endDate: null,
    isCurrent: true,
    isHighlighted: true,
    isRemote: true,
    shortTitle: null,
    slug: 'craft',
    startDate: new Date('2024-10-01'),
    state: null,
    title: 'Senior Software Engineer',
  },
  {
    city: null,
    company: USLegeAI,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        ESLint,
        Observability,
        Zod,
        TanStackQuery,
        Pino,
        Prettier,
        FramerMotion,
        MUIMaterialUI,
        SystemsArchitecture,
        NextJs,
        DesignUXPartnership,
        CSS,
        ComponentArchitecture,
        Turborepo,
      ],
      isVisible: false,
      summary: [
        {
          content: `Developing software tools that leverage Artificial Intelligence (LLMs) that
           allow customers to gain more meaningful insights from large amounts of political
           data.`,
        },
      ],
    },
    endDate: null,
    isCurrent: false,
    isHighlighted: false,
    isRemote: true,
    shortTitle: 'Founding S. Software Eng.',
    slug: 'uslege',
    startDate: new Date('2024-06-03'),
    state: null,
    title: 'Founding Senior Software Engineer',
  },
  {
    city: null,
    company: Northbeam,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        React,
        TypeScript,
        GraphQL,
        TailwindCSS,
        SASS,
        ReactNative,
        GCP,
        Storybook,
        ComponentArchitecture,
        ResponsiveDesign,
        Lerna,
        ESLint,
        Observability,
        Zod,
        Prettier,
        Mantine,
        SystemsArchitecture,
        CiCdPipelineDesign,
        ExpressJs,
        PnpmWorkspaces,
        UnitIntegrationE2E,
        DesignUXPartnership,
        NodeJs,
        JavaScript,
        PostgreSQL,
        Docker,
        EngineeringLeadership,
        Jest,
        Npm,
        FramerMotion,
        FloatingUI,
        Bash,
        ApplicationSecurity,
        Amplitude,
        HTML,
        CSS,
        BugSnag,
        Git,
        Nvm,
        AuthenticationAuthorization,
        RelationalDatabases,
      ],
      content: [
        {
          content: `Designed and implemented a currency localization system enabling all marketing
           analytics to be denominated in a user-configurable currency, directly expanding the
           platform's addressable market to international customers.`,
          title: 'Multi-Currency Analytics',
        },
        {
          content: `Architected a well-tested, flexible internal component library built on React,
           SASS, and TailwindCSS. Enabled significantly faster feature development, reduced UI
           inconsistency across the product, and made design-scope changes far easier to absorb
           throughout the codebase.`,
          title: 'Component Library',
        },
      ],
      summary: [
        {
          content: `Contributed to the ongoing development of Northbeam's flagship marketing
           analytics platform across web and mobile surfaces.`,
        },
      ],
    },
    endDate: new Date('2024-06-01'),
    isCurrent: false,
    isHighlighted: true,
    isRemote: true,
    shortTitle: null,
    slug: 'northbeam',
    startDate: new Date('2023-07-01'),
    state: null,
    title: 'Senior Software Engineer',
  },
  {
    city: 'Washington',
    company: ShelfCycle,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        NextJs,
        TRPC,
        React,
        Prisma,
        Vercel,
        TypeScript,
        SSR_RSC,
        ESLint,
        Zod,
        Prettier,
        Mantine,
        CiCdPipelineDesign,
        UnitIntegrationE2E,
        DesignUXPartnership,
        SASS,
        ResponsiveDesign,
        JavaScript,
        AWS,
        ComponentArchitecture,
        Observability,
        PostgreSQL,
        AWSS3,
        RESTAPIDesign,
        Jest,
        Npm,
        TanStackQuery,
        Pino,
        Bash,
        ApplicationSecurity,
        HTML,
        CSS,
        Git,
        Nvm,
        AuthenticationAuthorization,
        Clerk,
        RelationalDatabases,
      ],
      summary: [
        {
          content: `Contributed to early MVP development of a web-based inventory management, order
           management, and accounting platform for the chemical supply chain industry. Organized
           Agile workflows, led team meetings, and mentored engineers less familiar with the stack
           built on Next.js, TRPC, Prisma, and Vercel.`,
        },
      ],
    },
    endDate: new Date('2023-08-01'),
    isCurrent: false,
    isHighlighted: true,
    isRemote: false,
    shortTitle: null,
    slug: 'shelfcycle',
    startDate: new Date('2023-04-01'),
    state: 'DC',
    title: 'Founding Engineer',
  },
  {
    city: 'Vienna',
    company: Corsha,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        NextJs,
        TypeScript,
        React,
        SASS,
        Prisma,
        PostgreSQL,
        NodeJs,
        Docker,
        Jenkins,
        SonarQube,
        Jest,
        Storybook,
        Accessibility,
        CiCdPipelineDesign,
        ESLint,
        Zod,
        Prettier,
        MUIMaterialUI,
        ExpressJs,
        UnitIntegrationE2E,
        DesignUXPartnership,
        ResponsiveDesign,
        JavaScript,
        ComponentArchitecture,
        Observability,
        Poetry,
        Black,
        Codecov,
        SSR_RSC,
        Tox,
        Microservices,
        EngineeringLeadership,
        RESTAPIDesign,
        Npm,
        Pino,
        AntdAntDesign,
        Bash,
        ApplicationSecurity,
        HTML,
        CSS,
        Git,
        Nvm,
        Pyenv,
        Pip,
        AuthenticationAuthorization,
        SWR,
        RelationalDatabases,
      ],
      content: [
        {
          channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
          children: [
            {
              content: `Led the development of an internal component library and established
               patterns associated with reusable components, component documentation and component
               testing.`,
              title: 'Component Library',
            },
            {
              content: `Established protocols for communicating errors between the client and the
               server and incorporated these methods into UI components responsible for making
               server requests, communicating feedback to users and making decisions based on
               error control flow.`,
              title: 'Error Communication Protocols',
            },
          ],
          title: 'Notable Technical Contributions',
          type: NodeType.BulletedList,
        },
      ],
      summary: [
        {
          content: `Team lead for the "Corsha Console," a modern customer-facing web platform
           enabling customers to manage, monitor, and configure proprietary network security
           technology. Owned the product roadmap from initial planning through delivery: scoped the
           system architecture, established Agile workflows, coordinated with an external UI/UX
           design firm on the full UX and user flow, and led the engineering team through
           implementation. Maintained high code quality through rigorous PR review and active
           mentoring of less experienced engineers.`,
        },
      ],
    },
    endDate: new Date('2023-03-01'),
    isCurrent: false,
    isHighlighted: true,
    isRemote: false,
    shortTitle: null,
    slug: 'corsha',
    startDate: new Date('2022-06-01'),
    state: 'VA',
    title: 'Software Engineer',
  },
  {
    city: null,
    company: GreenBudget,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        Python,
        DjangoRESTFramework,
        React,
        ReduxSagas,
        TypeScript,
        PostgreSQL,
        Redis,
        Celery,
        AWSS3,
        AWSEC2,
        CircleCI,
        Docker,
        Pytest,
        WebSockets,
        DjangoChannels,
        ESLint,
        Django,
        AWSElasticBeanstalk,
        Observability,
        AWS,
        Prettier,
        CiCdPipelineDesign,
        UnitIntegrationE2E,
        DesignUXPartnership,
        SASS,
        ResponsiveDesign,
        JavaScript,
        ComponentArchitecture,
        Poetry,
        Codecov,
        ReactRedux,
        Tox,
        NextJs,
        Pylint,
        Flake8,
        Microservices,
        EngineeringLeadership,
        RESTAPIDesign,
        Npm,
        AWSRDS,
        Vue,
        AntdAntDesign,
        AWSECS,
        AWSIAM,
        AWSElastiCache,
        Bash,
        AuthenticationAuthorization,
        ApplicationSecurity,
        HTML,
        CSS,
        Git,
        Nvm,
        Pyenv,
        Pip,
        Sentry,
        RelationalDatabases,
      ],
      content: [
        {
          content: `Spearheaded a comprehensive automated testing suite and CI/CD integration that
           increased test coverage by approximately 70%, meaningfully improving platform stability
           and release confidence.`,
          title: 'Testing &amp; CI/CD',
        },
      ],
      summary: [
        {
          content: `Architected and led development of GreenBudget, a real-time, multi-user
           collaborative budgeting and payroll platform for the film production industry, addressing
           a gap where producers relied on cumbersome spreadsheets and outdated tools. Launched
           February 2022; by May 2022, the platform had grown to over 1,000 users with approximately
           40-50% on paid subscriptions and had been adopted by several film studios for beta
           testing (now operating as Saturation at saturation.io).`,
        },
      ],
    },
    endDate: new Date('2022-05-01'),
    isCurrent: false,
    isHighlighted: true,
    isRemote: true,
    shortTitle: null,
    slug: 'greenbudget',
    startDate: new Date('2021-02-01'),
    state: null,
    title: 'Co-Founder & Creator',
  },
  {
    city: null,
    company: NirvedaCognition,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        Python,
        DjangoRESTFramework,
        React,
        ReduxSagas,
        TypeScript,
        Auth0,
        PostgreSQL,
        Celery,
        AWS,
        Docker,
        Jenkins,
        ESLint,
        Django,
        Observability,
        Prettier,
        StyledComponents,
        Pytest,
        CiCdPipelineDesign,
        Redis,
        DjangoChannels,
        UnitIntegrationE2E,
        DesignUXPartnership,
        AWSEC2,
        SASS,
        ResponsiveDesign,
        JavaScript,
        Poetry,
        Codecov,
        ReactRedux,
        Tox,
        Pylint,
        Flake8,
        WebSockets,
        EngineeringLeadership,
        AWSS3,
        RESTAPIDesign,
        Npm,
        AWSRDS,
        AntdAntDesign,
        AWSIAM,
        Bash,
        AuthenticationAuthorization,
        ApplicationSecurity,
        HTML,
        CSS,
        AWSCloudwatch,
        Git,
        Nvm,
        Pyenv,
        Pip,
        Sentry,
        RelationalDatabases,
      ],
      content: [
        {
          channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
          content: `I was brought on at Nirveda at a time when significant parts of the code
           application(s) had to be re-designed to support the size and scale of current and
           future customers. I led the architecture re-design and implementation, addressing
           scalability and maintainability concerns while simultaneously onboarding new customers.
           As a direct result of my contributions, the sales team was able to onboard several new
           top-tier Enterprise level customers.`,
          title: 'Rebuild',
        },
      ],
      summary: [
        {
          content: `Responsible for the full consumer-facing product: infrastructure architecture,
           feature development, and technical leadership of a small engineering team. Managed task
           allocation, conducted all code reviews, and led feature initiatives from planning through
           delivery. Spearheaded an automated testing and CI/CD initiative that increased test
           coverage by approximately 70%.`,
        },
      ],
    },
    endDate: new Date('2021-03-01'),
    isCurrent: false,
    isHighlighted: true,
    isRemote: true,
    shortTitle: null,
    slug: 'nirveda',
    startDate: new Date('2020-09-01'),
    state: null,
    title: 'Technical Lead',
  },
  {
    city: 'Arlington',
    company: SaracenEnergy,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        Python,
        Flask,
        React,
        ReactRedux,
        TypeScript,
        ReduxSagas,
        Docker,
        Jenkins,
        Pytest,
        PostgreSQL,
        RabbitMQ,
        ElasticSearch,
        SQLAlchemy,
        ESLint,
        Prettier,
        StyledComponents,
        CiCdPipelineDesign,
        UnitIntegrationE2E,
        DesignUXPartnership,
        SASS,
        ResponsiveDesign,
        JavaScript,
        AWS,
        YarnWorkspaces,
        EventDrivenArchitecture,
        Flake8,
        WebSockets,
        RESTAPIDesign,
        MySql,
        Npm,
        AntdAntDesign,
        DataScraping,
        Bash,
        AuthenticationAuthorization,
        ApplicationSecurity,
        HTML,
        CSS,
        Git,
        Nvm,
        Pyenv,
        Pip,
        Rundeck,
        RelationalDatabases,
      ],
      content: [
        {
          channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
          content: `Created a sub-application used daily by traders that allowed them to analyze
           the differences, modifications and frequencies of changes between electricity grid data
           at different points in time. With this application, traders were able to more
           efficiently track outages and other important events in different electrical grids.`,
          title: 'Diff Reporting',
        },
      ],
      summary: [
        {
          content: `Developed front-end and back-end analytical tooling used by the trading desk to
           inform investment decisions, bridging the gap between quantitative analysis and software
           development teams.`,
        },
      ],
    },
    endDate: new Date('2020-09-01'),
    isCurrent: false,
    isHighlighted: true,
    isRemote: false,
    shortTitle: null,
    slug: 'saracen',
    startDate: new Date('2020-04-01'),
    state: 'VA',
    title: 'Full Stack Software Developer',
  },
  {
    city: 'Washington',
    company: TheAtlantic,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        Python,
        Django,
        DjangoRESTFramework,
        Flask,
        NodeJs,
        RESTAPIDesign,
        PostgreSQL,
        AWSLambda,
        AWSS3,
        AWSElasticBeanstalk,
        Celery,
        Docker,
        Jenkins,
        Pytest,
        ESLint,
        Observability,
        Prettier,
        SystemsArchitecture,
        CiCdPipelineDesign,
        ExpressJs,
        UnitIntegrationE2E,
        AWSEC2,
        ResponsiveDesign,
        JavaScript,
        AWS,
        React,
        MongoDB,
        Poetry,
        Codecov,
        Tox,
        Pylint,
        Flake8,
        Microservices,
        Jest,
        MySql,
        Npm,
        Bash,
        AuthenticationAuthorization,
        Asyncio,
        ApplicationSecurity,
        HTML,
        CSS,
        Git,
        Pyenv,
        Pip,
        JQuery,
        PackageDevelopment,
        Handlebars,
        Jinja,
        Sentry,
        RelationalDatabases,
      ],
      content: [
        {
          channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
          content: `Spent a year overhauling the entire revenue/subscription model and its
           applicable services as a decoupled REST API using django-rest-framework that could
           independently support subscriptions and memberships at The Atlantic.`,
          title: 'Accounts API',
        },
      ],
      summary: [
        {
          content: `Backend Python developer supporting The Atlantic's CMS, subscriptions, and
           digital products. Designed and implemented the Apple News syndication pipeline, opening a
           new digital distribution channel and directly contributing an additional revenue stream
           for the company.`,
        },
      ],
    },
    endDate: new Date('2020-04-01'),
    isCurrent: false,
    isHighlighted: true,
    isRemote: false,
    shortTitle: null,
    slug: 'atlantic',
    startDate: new Date('2018-04-01'),
    state: 'DC',
    title: 'Platform Developer',
  },
  {
    city: 'Washington',
    company: TheRockCreekGroup,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        Python,
        DjangoRESTFramework,
        Django,
        React,
        ReactRedux,
        NodeJs,
        SASS,
        MySql,
        MongoDB,
        D3Js,
        AWSLambda,
        AWSS3,
        Pandas,
        StyledComponents,
        DesignUXPartnership,
        AWSEC2,
        JavaScript,
        AWS,
        PostgreSQL,
        ReactNative,
        Pylint,
        WebSockets,
        NoSQLDatabases,
        RESTAPIDesign,
        Npm,
        AWSDynamoDB,
        AWSIAM,
        DataScraping,
        Bash,
        ApplicationSecurity,
        MeteorJS,
        HTML,
        CSS,
        Git,
        Pip,
        R,
        AuthenticationAuthorization,
        JQuery,
        Scipy,
        Numpy,
        ScikitLearn,
        Handlebars,
        RelationalDatabases,
      ],
      content: [
        {
          channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
          content: `Rebuilt the firm's primary internal analytical tool into a more
           interactive/dynamical tool using a react/Redux front-end consuming an API built using
           django-rest-framework.`,
          title: 'Transparency',
        },
        {
          channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
          content: `Constructed an application, Rock Creek Insights, using MeteorJS that the firm
           uses to provide client risk reporting, monitor risk and compare performances of managed
           pension funds.`,
          title: 'Rock Creek Insights',
        },
        {
          channels: [SyndicationChannel.LinkedIn, SyndicationChannel.Website],
          content: `Created a custom, flexible and proprietary charting package using D3.js that
           the firm now uses in a variety of applications to visualize data in more than 2
           dimensions and animate the visualization over time.`,
          title: 'Asset Visualizations',
        },
      ],
      summary: [
        {
          content: `Built internal analytical tooling and data infrastructure supporting investment
           decision-making at a multi-billion dollar asset management firm. Regularly bridged
           quantitative analysis and software development teams, formalizing and automating
           previously manual analytical workflows through Python-based tooling. This role marks the
           foundation of my professional software engineering practice.`,
        },
      ],
    },
    endDate: new Date('2018-04-01'),
    isCurrent: false,
    isHighlighted: true,
    isRemote: false,
    shortTitle: null,
    slug: 'rockcreek',
    startDate: new Date('2016-07-01'),
    state: 'DC',
    title: 'Quantitative Analyst, Investment Analytics & Data',
  },
  {
    city: 'Olney',
    company: PIAnalytics,
    content: {
      channels: AllSyndicationChannels,
      competencies: [
        Python,
        JavaScript,
        Flask,
        Django,
        CreditDefaultRiskModeling,
        NumericalComputation,
        MonteCarloMethods,
        Pandas,
        HTML,
        CSS,
        Git,
        Pip,
        R,
        JQuery,
        Scipy,
        Numpy,
        ScikitLearn,
        Handlebars,
        RelationalDatabases,
      ],
      summary: [
        {
          content: `Researched and implemented complex models for credit default risk across exotic
           derivatives and structured products, using Python for numerical computation and Monte
           Carlo simulation.`,
        },
      ],
    },
    endDate: new Date('2016-07-01'),
    isCurrent: false,
    isHighlighted: true,
    isRemote: false,
    shortTitle: null,
    slug: 'pianalytics',
    startDate: new Date('2015-04-01'),
    state: 'MD',
    title: 'Quantitative Research Analyst',
  },
];

const BySlug = new Map(Roles.map(role => [role.slug, role]));

/**
 * Look up roles by slug, in the order given, failing loudly on a typo.
 *
 * Returns the AUTHORED records rather than resolved ones: the syndication channel is not known
 * here, so resolution happens in the renderer that knows which channel it is rendering for.
 */
export function rolesBySlug(slugs: string[]): RoleInput[] {
  return slugs.map(slug => {
    const role = BySlug.get(slug);
    if (!role) {
      throw new Error(
        `No role with slug '${slug}'. Known slugs: ${[...BySlug.keys()].join(', ')}.`,
      );
    }
    return role;
  });
}
