/**
 * The institutions a degree is attached to.
 *
 * `School` is a legacy model being reused rather than replaced; see `./companies.ts` for why these
 * are module constants.
 */
import { type School } from './types';

export const TheJohnsHopkinsUniversity: School = {
  city: 'Baltimore',
  description: null,
  logoFileName: 'JHU.svg',
  logoImageUrl: null,
  name: 'The Johns Hopkins University',
  shortName: null,
  slug: 'the-johns-hopkins-university',
  state: 'MD',
  websiteUrl: null,
};
export const RensselaerPolytechnicInstitute: School = {
  city: 'Troy',
  description: null,
  logoFileName: 'RPI.svg',
  logoImageUrl: null,
  name: 'Rensselaer Polytechnic Institute',
  shortName: null,
  slug: 'rensselaer-polytechnic-institute',
  state: 'NY',
  websiteUrl: null,
};
