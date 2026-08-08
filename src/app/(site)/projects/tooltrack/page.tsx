import { getPageProject } from '~/actions/projects/get-page-project';

import { ToolTrack } from '~/features/projects/components/pages/ToolTrack';

import { RedirectIfNotVisible } from '../RedirectIfNotVisible';

const ToolTrackPage = async () => {
  const project = await getPageProject('tooltrack');

  return (
    <RedirectIfNotVisible project={project}>
      <ToolTrack project={project} />
    </RedirectIfNotVisible>
  );
};

export default ToolTrackPage;
