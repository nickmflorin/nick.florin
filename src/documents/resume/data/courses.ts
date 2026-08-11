/**
 * Every university course, carried over from the legacy schema (decided 2026-08-11), re-parented
 * onto degrees by slug (the additive `degreeId` FK) with legacy skill links translated to
 * competency associations.
 */
import {
  CPlusPlus,
  DataScraping,
  DataVisualization,
  Django,
  HTML,
  Jinja,
  Matlab,
  NumericalComputation,
  Numpy,
  OptimizationMethods,
  Python,
  ScikitLearn,
  Scipy,
} from './competencies';
import { type Course, SyndicationChannel } from './types';

export const AdvancedEquityDerivatives: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'jhu-financial',
  description: null,
  name: 'Advanced Equity Derivatives',
  shortName: null,
  slug: 'advanced-equity-derivatives',
  visible: true,
};
export const StochasticProcesses: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'jhu-financial',
  description: null,
  name: 'Stochastic Processes',
  shortName: null,
  slug: 'stochastic-processes',
  visible: true,
};
export const StochasticCalculus: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'jhu-financial',
  description: null,
  name: 'Stochastic Calculus',
  shortName: null,
  slug: 'stochastic-calculus',
  visible: true,
};
export const FinancialDerivatives: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'jhu-financial',
  description: null,
  name: 'Financial Derivatives',
  shortName: null,
  slug: 'financial-derivatives',
  visible: true,
};
export const StructuredProducts: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'jhu-financial',
  description: null,
  name: 'Structured Products',
  shortName: null,
  slug: 'structured-products',
  visible: true,
};
export const CreditDefaultRiskModeling: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'jhu-financial',
  description: null,
  name: 'Credit Default Risk Modeling',
  shortName: 'Credit Default Risk',
  slug: 'credit-default-risk-modeling',
  visible: true,
};
export const MachineLearning: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [Python],
  degree: 'jhu-financial',
  description: null,
  name: 'Machine Learning',
  shortName: null,
  slug: 'machine-learning',
  visible: true,
};
export const TimeSeriesAnalysis: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [DataVisualization],
  degree: 'jhu-financial',
  description: null,
  name: 'Time Series Analysis',
  shortName: null,
  slug: 'time-series-analysis',
  visible: true,
};
export const MonteCarloMethods: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [Matlab, OptimizationMethods, NumericalComputation, Python],
  degree: 'jhu-financial',
  description: null,
  name: 'Monte Carlo Methods',
  shortName: null,
  slug: 'monte-carlo-methods',
  visible: true,
};
export const ProbabilisticModelsInComputerScience: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'jhu-computational',
  description: null,
  name: 'Probabalistic Models in Computer Science',
  shortName: 'Probabalistic Models',
  slug: 'probabilistic-models-in-computer-science',
  visible: true,
};
export const QueueingTheoryAndItsApplicationsInComputerScience: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [NumericalComputation],
  degree: 'jhu-computational',
  description: null,
  name: 'Queueing Theory and its Applications in Computer Science',
  shortName: 'Queueing Theory',
  slug: 'queueing-theory-and-its-applications-in-computer-science',
  visible: true,
};
export const DataMining: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [DataVisualization, Python, DataScraping, Scipy, Numpy, ScikitLearn],
  degree: 'jhu-computational',
  description: null,
  name: 'Data Mining',
  shortName: null,
  slug: 'data-mining',
  visible: true,
};
export const NeuralNetworks: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [DataVisualization, Python],
  degree: 'jhu-computational',
  description: null,
  name: 'Neural Networks',
  shortName: null,
  slug: 'neural-networks',
  visible: true,
};
export const ComputerScience: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [CPlusPlus],
  degree: 'rpi',
  description: null,
  name: 'Computer Science',
  shortName: null,
  slug: 'computer-science',
  visible: true,
};
export const EmbeddedControl: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [CPlusPlus],
  degree: 'rpi',
  description: null,
  name: 'Embedded Control',
  shortName: null,
  slug: 'embedded-control',
  visible: true,
};
export const FieldsWaves: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'rpi',
  description: null,
  name: 'Fields & Waves',
  shortName: null,
  slug: 'fields-waves',
  visible: true,
};
export const ElectricalPowerSystems: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'rpi',
  description: null,
  name: 'Electrical Power Systems',
  shortName: null,
  slug: 'electrical-power-systems',
  visible: true,
};
export const DigitalComponentsOperations: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'rpi',
  description: null,
  name: 'Digital Components & Operations',
  shortName: null,
  slug: 'digital-components-operations',
  visible: true,
};
export const Economics: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'rpi',
  description: null,
  name: 'Economics',
  shortName: null,
  slug: 'economics',
  visible: true,
};
export const ManagerialEconomics: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'rpi',
  description: null,
  name: 'Managerial Economics',
  shortName: null,
  slug: 'managerial-economics',
  visible: true,
};
export const ProbabilityTheory: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'rpi',
  description: null,
  name: 'Probability Theory',
  shortName: null,
  slug: 'probability-theory',
  visible: true,
};
export const ElectricalEngineeringDesign: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [Django, Python, HTML, Jinja],
  degree: 'rpi',
  description: null,
  name: 'Electrical Engineering Design',
  shortName: null,
  slug: 'electrical-engineering-design',
  visible: true,
};
export const SignalsSystems: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [],
  degree: 'rpi',
  description: null,
  name: 'Signals & Systems',
  shortName: null,
  slug: 'signals-systems',
  visible: true,
};
export const Robotics: Course = {
  channels: [SyndicationChannel.Website],
  competencies: [Matlab, NumericalComputation, Python],
  degree: 'rpi',
  description: null,
  name: 'Robotics',
  shortName: null,
  slug: 'robotics',
  visible: true,
};

export const Courses: Course[] = [
  AdvancedEquityDerivatives,
  StochasticProcesses,
  StochasticCalculus,
  FinancialDerivatives,
  StructuredProducts,
  CreditDefaultRiskModeling,
  MachineLearning,
  TimeSeriesAnalysis,
  MonteCarloMethods,
  ProbabilisticModelsInComputerScience,
  QueueingTheoryAndItsApplicationsInComputerScience,
  DataMining,
  NeuralNetworks,
  ComputerScience,
  EmbeddedControl,
  FieldsWaves,
  ElectricalPowerSystems,
  DigitalComponentsOperations,
  Economics,
  ManagerialEconomics,
  ProbabilityTheory,
  ElectricalEngineeringDesign,
  SignalsSystems,
  Robotics,
];
