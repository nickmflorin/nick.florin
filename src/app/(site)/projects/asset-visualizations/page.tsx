import { db } from '~/database/prisma';

import { convertToPlainObject } from '~/api/serialization';

import { AssetVisualizations } from '~/features/projects/components/pages/AssetVisualizations';

import { RedirectIfNotVisible } from '../RedirectIfNotVisible';

const AssetVisualizationsPage = async () => {
  const project = convertToPlainObject(
    await db.project.findUniqueOrThrow({
      include: { repositories: true, skills: true },
      where: { slug: 'asset-visualizations' },
    }),
  );
  return (
    <RedirectIfNotVisible project={project}>
      <AssetVisualizations project={project} />
    </RedirectIfNotVisible>
  );
};

export default AssetVisualizationsPage;
