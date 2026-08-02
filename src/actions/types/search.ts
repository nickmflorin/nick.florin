import { type Brand, type BrandModel } from '~/database/model';
import { constructOrSearch } from '~/database/util';

type TabledBrand = Extract<
  Brand,
  | 'company'
  | 'course'
  | 'detail'
  | 'education'
  | 'experience'
  | 'project'
  | 'repository'
  | 'resume'
  | 'school'
  | 'skill'
>;

export const PAGE_SIZES = {
  company: 8,
  course: 16,
  detail: 8,
  education: 8,
  experience: 8,
  project: 8,
  repository: 8,
  resume: 8,
  school: 8,
  skill: 16,
} as const satisfies Record<TabledBrand, number>;

export const SEARCH_FIELDS = {
  company: ['name', 'shortName', 'description', 'city', 'state'],
  course: ['name', 'shortName', 'slug'],
  detail: ['label', 'description', 'shortDescription'],
  education: ['major', 'concentration', 'minor', 'shortMajor'],
  experience: ['title', 'shortTitle'],
  project: ['name', 'shortName', 'slug'],
  repository: ['slug', 'npmPackageName'],
  resume: ['filename', 'pathname', 'url'],
  school: ['name', 'shortName', 'description', 'city', 'state'],
  skill: ['slug', 'label'],
} as const satisfies {
  [key in TabledBrand]: (keyof BrandModel<key>)[];
};

export const constructTableSearchClause = (brand: TabledBrand, search: string) =>
  constructOrSearch(search, [...SEARCH_FIELDS[brand]]);
