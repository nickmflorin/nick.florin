import { db } from '~/database/prisma';

import { convertToPlainObject } from '~/api/serialization';

import { ToolTrack } from '~/features/projects/components/pages/ToolTrack';

import { RedirectIfNotVisible } from '../RedirectIfNotVisible';

const ToolTrackPage = async () => {
  const project = convertToPlainObject(
    await db.project.findUniqueOrThrow({
      include: { repositories: true, skills: true },
      where: { slug: 'tooltrack' },
    }),
  );

  return (
    <RedirectIfNotVisible project={project}>
      <ToolTrack project={project} />
    </RedirectIfNotVisible>
  );
};

export default ToolTrackPage;
