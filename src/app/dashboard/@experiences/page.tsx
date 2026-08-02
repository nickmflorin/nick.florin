import { fetchExperiences } from '~/actions/experiences/fetch-experiences';

import { ResumeModelCondensedTile } from '~/features/resume/components/tiles/ResumeModelCondensedTile';

const ExperiencesPage = async () => {
  const fetcher = fetchExperiences([]);
  const { data: experiences } = await fetcher(
    {
      filters: { highlighted: true },
      visibility: 'public',
    },
    { strict: true },
  );
  return (
    <>
      {experiences.map((experience, index) => (
        <ResumeModelCondensedTile
          areTagsVisible={false}
          isDescriptionShowMoreLinkVisible
          isTitleExpandable
          key={index}
          model={experience}
        />
      ))}
    </>
  );
};

export default ExperiencesPage;
