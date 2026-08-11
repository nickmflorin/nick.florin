# Legacy Skill → Competency Mapping

Decided 2026-08-09 via the grouped audit walkthrough; amended 2026-08-10 to reinstate nine dropped
skills as competencies (`git`, `pyenv`, `nvm`, `npm`, `pip`, `CSS`, `HTML`, `jQuery`, `MeteorJS`) —
see `decisions.md`. This table is the port's translation layer: every `skills:` slug reference on
legacy experiences, educations, details and courses resolves through it. Legacy records are never
modified — a **drop** means the skill maps to no competency and its references are omitted from the
ported content.

Membership follows the catalog principle (decided 2026-08-10, see `decisions.md`): the competency
registry is an exhaustive catalog of everything used, learned, and worked with across the career,
independent of what any syndication channel renders. A **drop** below therefore means "not a real
skill/competency", never "not currently shown anywhere" — a competency that renders nowhere still
belongs in the catalog.

New-competency slugs are not authored here: they derive from the label via `slugify` at parse time,
per the slug-derivation decision (2026-08-04).

## Identity (61) — same slug exists in `competencies.yaml`

- `eslint` — ESLint
- `django` — Django
- `aws-elastic-beanstalk` — AWS Elastic Beanstalk
- `numerical-computation` — Numerical Computation
- `python` — Python
- `zod` — zod
- `prettier` — Prettier
- `styled-components` — styled-components
- `mantine` — Mantine
- `pytest` — pytest
- `gcp` — GCP
- `redis` — Redis
- `auth0` — Auth0
- `django-channels` — Django Channels
- `django-rest-framework` — Django REST Framework
- `aws-ec2` — AWS EC2
- `jenkins` — Jenkins
- `sass` — SCSS & SASS
- `responsive-design` — Responsive Design
- `javascript` — Javascript
- `aws` — AWS
- `postgresql` — PostgreSQL
- `react` — React
- `typescript` — TypeScript
- `graphql` — GraphQL
- `celery` — celery
- `sqlalchemy` — SQLAlchemy
- `swift` — Swift
- `poetry` — poetry
- `black` — black
- `codecov` — codecov
- `circleci` — CircleCI
- `react-redux` — React Redux
- `redux-sagas` — Redux-Sagas
- `trpc` — TRPC
- `sonarqube` — SonarQube
- `tox` — tox
- `vercel` — Vercel
- `react-native` — React Native
- `flask` — Flask
- `tailwindcss` — TailwindCSS
- `docker` — docker
- `rabbitmq` — RabbitMQ
- `pylint` — pylint
- `flake8` — flake8
- `pandas` — pandas
- `elasticsearch` — ElasticSearch
- `nosql-databases` — noSQL Databases
- `rest-api-design` — REST API Design
- `jest` — jest
- `turborepo` — turborepo
- `mysql` — mySQL
- `mongodb` — mongoDB
- `apollo-server` — Apollo Server
- `monorepo-nx` — Monorepo (Nx)
- `microfrontends` — Microfrontends
- `performance-engineering` — Performance Engineering
- `accessibility-axe-core` — Accessibility (axe-core)
- `datadog` — Datadog
- `playwright` — Playwright
- `github-actions` — GitHub Actions

## Slug variants (6) — same skill, YAML slug wins

| Legacy label [slug]         | Competency [slug]         |
| --------------------------- | ------------------------- |
| expressJS [`expressjs`]     | Express.js [`express-js`] |
| nodeJS [`nodejs`]           | Node.js [`node-js`]       |
| C++ [`c-plus-plus`]         | C++ [`c`]                 |
| d3.js [`d3js`]              | d3.js [`d3-js`]           |
| NextJS [`nextjs`]           | Next.js [`next-js`]       |
| Web Sockets [`web-sockets`] | WebSockets [`websockets`] |

## Folds into existing competencies (31)

| Legacy label [slug]                                                       | Target competency slug      |
| ------------------------------------------------------------------------- | --------------------------- |
| Logging & Monitoring Infrastructure [`logging-monitoring-infrastructure`] | `observability`             |
| AWS Route 53 [`aws-route-53`]                                             | `aws`                       |
| Material UI [`material-ui`]                                               | `mui-material-ui`           |
| Monolith Architecture [`monolith-architecture`]                           | `systems-architecture`      |
| CI/CD [`ci-cd`]                                                           | `ci-cd-pipeline-design`     |
| NextJS Pages Router [`nextjs-pages-router`]                               | `next-js`                   |
| NextJS App Router [`nextjs-app-router`]                                   | `next-js`                   |
| StorybookJS [`storybookjs`]                                               | `storybook`                 |
| pnpm [`pnpm`]                                                             | `pnpm-workspaces`           |
| Integration Testing [`integration-testing`]                               | `unit-integration-e2e`      |
| UI/UX [`ui-ux`]                                                           | `design-ux-partnership`     |
| PrismaJS [`prismajs`]                                                     | `prisma`                    |
| Component Development [`component-development`]                           | `component-architecture`    |
| Error Monitoring/Alerting [`error-monitoring-alerting`]                   | `observability`             |
| SCSS/CSS Modules [`scss-css-modules`]                                     | `sass`                      |
| unittest [`unittest`]                                                     | `pytest`                    |
| yarn [`yarn`]                                                             | `yarn-workspaces`           |
| mongooseJS [`mongoosejs`]                                                 | `mongodb`                   |
| Message Buses [`message-buses`]                                           | `event-driven-architecture` |
| AWS Lambdas [`aws-lambdas`]                                               | `aws-lambda`                |
| SSR [`ssr`]                                                               | `ssr-rsc`                   |
| mock [`mock`]                                                             | `pytest`                    |
| Unit Testing [`unit-testing`]                                             | `unit-integration-e2e`      |
| Microservices Architecture [`microservices-architecture`]                 | `microservices`             |
| Django Admin [`django-admin`]                                             | `django`                    |
| Project Planning & Roadmapping [`project-planning-roadmapping`]           | `engineering-leadership`    |
| AWS S3 Storage [`aws-s3-storage`]                                         | `aws-s3`                    |
| Python 2/3 Compatibility [`python-23-compatibility`]                      | `python`                    |
| AWS Amplify [`aws-amplify`]                                               | `aws`                       |
| AWS Certificate Manager [`aws-certificate-manager`]                       | `aws`                       |
| AWS Secrets Manager [`aws-secrets-manager`]                               | `aws`                       |

## New competencies (44), and the legacy skills they absorb

| New competency label           | Legacy source skill(s)                                               |
| ------------------------------ | -------------------------------------------------------------------- |
| Data Visualization             | Data Visualizations                                                  |
| Matlab                         | Matlab                                                               |
| npm                            | npm                                                                  |
| Optimization Methods           | Optimization Methods                                                 |
| TanStack Query                 | @tanstack/react-query                                                |
| pino                           | pino                                                                 |
| AWS RDS                        | AWS RDS                                                              |
| Vue                            | Vue                                                                  |
| framer-motion                  | framer-motion                                                        |
| AWS DynamoDB                   | AWS DynamoDB                                                         |
| antd (Ant Design)              | antd                                                                 |
| AWS ECS                        | AWS ECS                                                              |
| AWS IAM                        | AWS Identity & Access Management                                     |
| Floating UI                    | Floating UI                                                          |
| AWS ElastiCache                | AWS ElastiCache                                                      |
| Data Scraping                  | Data Scraping                                                        |
| Bash                           | bash                                                                 |
| Authentication & Authorization | JWT Authentication, Authentication Protocols, Session Authentication |
| asyncio                        | asyncio                                                              |
| Application Security           | Application Security, Security Practices                             |
| MeteorJS                       | MeteorJS                                                             |
| Amplitude                      | Amplitude                                                            |
| HTML                           | HTML                                                                 |
| CSS                            | CSS                                                                  |
| AWS Cloudwatch                 | AWS Cloudwatch                                                       |
| BugSnag                        | BugSnag                                                              |
| git                            | git                                                                  |
| nvm                            | nvm                                                                  |
| pyenv                          | pyenv                                                                |
| pip                            | pip                                                                  |
| R                              | R                                                                    |
| jQuery                         | jQuery                                                               |
| Clerk                          | Clerk                                                                |
| scipy                          | scipy                                                                |
| numpy                          | numpy                                                                |
| scikit-learn                   | scikit-learn                                                         |
| Package Development            | Package Development                                                  |
| Handlebars                     | Handlebars                                                           |
| Jinja                          | Jinja                                                                |
| SWR                            | swr                                                                  |
| Firebase                       | Google Firebase                                                      |
| Sentry                         | Sentry                                                               |
| Rundeck                        | Rundeck                                                              |
| Relational Databases           | Relational Databases                                                 |

## Dropped — legacy-only (13)

Confirmed for omission from the new competency set (audit stops 6–8, as amended 2026-08-10):

- @react-pdf [`react-pdf`]
- VBA [`vba`]
- Client Side Rendering [`client-side-rendering`]
- Error Handling [`error-handling`]
- ClickUp [`clickup`]
- Notion [`notion`]
- Agile Software Development [`agile-software-development`]
- linux [`linux`]
- Jira [`jira`]
- Clubhouse [`clubhouse`]
- HTML Templating [`html-templating`]
- Package & Dependency Management [`package-dependency-management`]
- SVGs [`svgs`]
