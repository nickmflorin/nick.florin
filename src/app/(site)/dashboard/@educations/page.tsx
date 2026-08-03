import { fetchEducations } from '~/actions/educations/fetch-educations';

import { ResumeModelCondensedTile } from '~/features/resume/components/tiles/ResumeModelCondensedTile';

const EducationsPage = async () => {
  const fetcher = fetchEducations([]);
  const { data: educations } = await fetcher(
    {
      filters: { highlighted: true },
      visibility: 'public',
    },
    { strict: true },
  );
  return (
    <>
      {educations.map((education, index) => (
        <ResumeModelCondensedTile
          areTagsVisible={false}
          isDescriptionShowMoreLinkVisible
          isTitleExpandable
          key={index}
          model={education}
        />
      ))}
    </>
  );
};

export default EducationsPage;
