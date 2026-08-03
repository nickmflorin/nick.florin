import { db } from '~/database/prisma';

import { convertToPlainObject } from '~/api/serialization';

import { Website } from '~/features/projects/components/pages/Website';

import { RedirectIfNotVisible } from '../RedirectIfNotVisible';

const WebsitePage = async () => {
  const project = convertToPlainObject(
    await db.project.findUniqueOrThrow({
      include: { repositories: true, skills: true },
      where: { slug: 'website' },
    }),
  );

  return (
    <RedirectIfNotVisible project={project}>
      <Website project={project} />
    </RedirectIfNotVisible>
  );
};

export default WebsitePage;
