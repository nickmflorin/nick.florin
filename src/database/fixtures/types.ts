import { type Brand } from '~/database/model';

export type JsonifiableModel = Extract<
  Brand,
  'company' | 'profile' | 'project' | 'repository' | 'school' | 'skill'
>;
