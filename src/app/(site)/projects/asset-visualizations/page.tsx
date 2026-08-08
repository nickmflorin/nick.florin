import { getPageProject } from '~/actions/projects/get-page-project';

import { AssetVisualizations } from '~/features/projects/components/pages/AssetVisualizations';

import { RedirectIfNotVisible } from '../RedirectIfNotVisible';

const AssetVisualizationsPage = async () => {
  const project = await getPageProject('asset-visualizations');
  return (
    <RedirectIfNotVisible project={project}>
      <AssetVisualizations project={project} />
    </RedirectIfNotVisible>
  );
};

export default AssetVisualizationsPage;
