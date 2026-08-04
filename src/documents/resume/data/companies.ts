/**
 * The employers a role is attached to.
 *
 * `Company` is one of the legacy models being reused rather than replaced, so these records mirror
 * the existing schema. They are module constants because several roles can share one employer and
 * that shared identity is what becomes the foreign key.
 */
import { type Company } from './types';

export const CraftEducationSystem: Company = {
  city: null,
  description: null,
  logoFileName: 'Craft.svg',
  logoImageUrl: null,
  name: 'Craft Education System',
  shortName: null,
  slug: 'craft-education-system',
  state: null,
  websiteUrl: null,
};
export const Northbeam: Company = {
  city: 'San Francisco',
  description: null,
  logoFileName: 'NorthBeam.svg',
  logoImageUrl: null,
  name: 'Northbeam',
  shortName: null,
  slug: 'northbeam',
  state: 'CA',
  websiteUrl: null,
};
export const ShelfCycle: Company = {
  city: 'Washington',
  description: null,
  logoFileName: 'ShelfCycle.svg',
  logoImageUrl: null,
  name: 'ShelfCycle',
  shortName: null,
  slug: 'shelfcycle',
  state: 'DC',
  websiteUrl: null,
};
export const Corsha: Company = {
  city: 'Vienna',
  description: null,
  logoFileName: 'Corsha.svg',
  logoImageUrl: null,
  name: 'Corsha',
  shortName: null,
  slug: 'corsha',
  state: 'VA',
  websiteUrl: null,
};
export const GreenBudget: Company = {
  city: 'Los Angeles',
  description: null,
  logoFileName: 'GreenBudget.svg',
  logoImageUrl: null,
  name: 'GreenBudget',
  shortName: null,
  slug: 'greenbudget',
  state: 'VA',
  websiteUrl: null,
};
export const NirvedaCognition: Company = {
  city: 'Los Angeles',
  description: null,
  logoFileName: 'Nirveda.svg',
  logoImageUrl: null,
  name: 'Nirveda Cognition',
  shortName: null,
  slug: 'nirveda-cognition',
  state: 'VA',
  websiteUrl: null,
};
export const SaracenEnergy: Company = {
  city: 'Houston',
  description: null,
  logoFileName: 'Saracen.svg',
  logoImageUrl: null,
  name: 'Saracen Energy',
  shortName: null,
  slug: 'saracen-energy',
  state: 'TX',
  websiteUrl: null,
};
export const TheAtlantic: Company = {
  city: 'Washington',
  description: null,
  logoFileName: 'TheAtlantic.png',
  logoImageUrl: null,
  name: 'The Atlantic',
  shortName: null,
  slug: 'the-atlantic',
  state: 'DC',
  websiteUrl: null,
};
export const TheRockCreekGroup: Company = {
  city: 'Washington',
  description: null,
  logoFileName: 'RockCreek.svg',
  logoImageUrl: null,
  name: 'The Rock Creek Group',
  shortName: null,
  slug: 'the-rock-creek-group',
  state: 'DC',
  websiteUrl: null,
};
export const PIAnalytics: Company = {
  city: 'Olney',
  description: null,
  logoFileName: 'PIAnalytics.svg',
  logoImageUrl: null,
  name: 'PI Analytics',
  shortName: null,
  slug: 'pi-analytics',
  state: 'MD',
  websiteUrl: null,
};
