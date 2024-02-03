import { type User as ClerkUser } from "@clerk/nextjs/api";

import { type User } from "../model";

export type SeedContext = {
  readonly clerkUser: ClerkUser;
  readonly user: User;
};

const skills = [
  "TypeScript",
  "Javascript",
  "GraphQL",
  "React",
  "Floating UI",
  "TailwindCSS",
  "React Native",
  "SCSS",
  "ChartJS",
  "pnpm",
  "NextJS",
  "TRPC",
  "React",
  "PrismaJS",
  "Vercel",
  "SSR",
  "TypeScript",
  "NextJS",
  "TypeScript",
  "React",
  "SCSS",
  "PrismaJS",
  "SSR",
  "docker",
  "Jenkins",
  "SonarQube",
  "PostgreSQL",
  "node",
  "Agile Software Development",
  "Project Planning & Roadmapping",
  "Security Practices",
  "CI/CD",
  "jest",
  "StorybookJS",
  "Python",
  "Django REST Framework",
  "React",
  "React Redux",
  "Redux-Sagas",
  "AWS S3 Storage",
  "CircleCI",
  "poetry",
  "docker",
  "TypeScript",
  "Redis",
  "tox",
  "codecov",
  "pytest",
  "CI/CD",
  "JWT Authentication",
  "PostgreSQL",
  "AWS EC2",
  "celery",
  "Python",
  "Django REST Framework",
  "React",
  "React Redux",
  "AWS",
  "AWS Cloudwatch",
  "TypeScript",
  "Auth0",
  "tox",
  "codecov",
  "pytest",
  "CI/CD",
  "Redix",
  "JWT Authentication",
  "PostgreSQL",
  "Django Channels",
  "Application Security",
  "celery",
  "poetry",
  "docker",
  "Agile Software Development",
  "Web Sockets",
  "Jenkins",
  "AWS EC2",
  "Python",
  "Flask",
  "Data Scraping",
  "React",
  "React Redux",
  "TypeScript",
  "Redux-Sagas",
  "docker",
  "Jenkins",
  "Rundeck",
  "pytest",
  "JWT Authentication",
  "Unit TEsting",
  "SQLAlchemy",
  "bash",
  "linux",
  "ElasticSearch",
  "Session Authentication",
  "SCSS",
  "RabbitMQ",
  "PostgreSQL",
  "Message Buses",
  "Python",
  "Python 2/3 Compatibility",
  "Package & Dependency Management",
  "Relational Databases",
  "nodeJS",
  "Django",
  "Django REST Framework",
  "REST API Design",
  "AWS S3 Storage",
  "Jenkins",
  "mySQL",
  "linux",
  "bash",
  "git",
  "Jinja",
  "Sentry",
  "Unit Testing",
  "Integration Testing",
  "unittest",
  "pytest",
  "mock",
  "Agile Software Development",
  "Jira",
  "HTML Templating",
  "celery",
  "poetry",
  "flake8",
  "tox",
  "docker",
  "asyncio",
  "mongooseJS",
  "expressJS",
  "AWS",
  "JWT Authentication",
  "jQuery",
  "Javascript",
  "Authentication Protocols",
  "Session Authentication",
  "Application Middleware",
  "AWS Elastic Beanstalk",
  "Python",
  "Javascript",
  "Data Scraping",
  "React",
  "React Redux",
  "nodeJS",
  "Django REST Framework",
  "Django",
  "CSS",
  "SCSS",
  "HTML Templating",
  "mySQL",
  "jQuery",
  "noSQL Databases",
  "mongoDB",
  "npm",
  "pandas",
  "MeteorJS",
  "d3.js",
  "AWS Lambdas",
  "Handlebars",
  "AWS S3 Storage",
  "git",
  "Python",
  "Javascript",
  "Flask",
  "Django",
  "Credit Default Risk Modeling",
  "Numerical Computation",
  "Monte Carlo Methods",
];
