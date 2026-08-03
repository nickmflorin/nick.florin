import { type EducationsFilters } from '~/actions';
import { fetchEducationsCount } from '~/actions/educations/fetch-educations';

export interface EducationsTitleProps {
  readonly filters: EducationsFilters;
}

export const EducationsTitle = async ({ filters }: EducationsTitleProps) => {
  const {
    data: { count },
  } = await fetchEducationsCount({ filters, visibility: 'admin' }, { strict: true });
  return <>{count}</>;
};
