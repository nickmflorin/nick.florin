import { getPageProject } from '~/actions/projects/get-page-project';

import { Website } from '~/features/projects/components/pages/Website';

import { RedirectIfNotVisible } from '../RedirectIfNotVisible';

const WebsitePage = async () => {
  const project = await getPageProject('website');

  return (
    <RedirectIfNotVisible project={project}>
      <Website project={project} />
    </RedirectIfNotVisible>
  );
};

export default WebsitePage;
