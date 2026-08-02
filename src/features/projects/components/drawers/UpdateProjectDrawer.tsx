import { type JSX } from 'react';

import { type BrandProject, type ProjectIncludes } from '~/database/model';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { useProjectForm } from '~/features/projects/components/forms/hooks';
import { UpdateProjectForm } from '~/features/projects/components/forms/UpdateProjectForm';
import { useProject } from '~/hooks/api';

interface UpdateProjectDrawerProps extends ExtendingDrawerProps {
  readonly eager: Pick<BrandProject, 'name'>;
  readonly projectId: string;
}

/**
 * The relations included when fetching the project being updated.
 *
 * The form does not yet expose inputs for skills, details or nested details, but the update
 * action already persists them, so they must still be included in the fetched project data (not
 * the form's inputs) to avoid wiping them out on every update.
 */
const UpdateProjectDrawerIncludes = [
  'skills',
  'repositories',
  'details',
  'nestedDetails',
] satisfies ProjectIncludes;

export const UpdateProjectDrawer = ({
  eager,
  onClose,
  projectId,
}: UpdateProjectDrawerProps): JSX.Element => {
  const { data, error, isLoading, isValidating } = useProject(projectId, {
    keepPreviousData: true,
    query: { includes: UpdateProjectDrawerIncludes, visibility: 'admin' },
  });
  const form = useProjectForm();

  return (
    <DrawerForm eagerTitle={eager.name} form={form} titleField='name'>
      <ApiResponseState data={data} error={error} isLoading={isLoading || isValidating}>
        {project => (
          <UpdateProjectForm
            form={form}
            onCancel={() => onClose()}
            onSuccess={() => onClose()}
            project={project}
          />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};
