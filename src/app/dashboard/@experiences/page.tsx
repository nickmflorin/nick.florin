import { fetchExperiences } from "~/actions-v2/experiences/fetch-experiences";

import { ResumeModelCondensedTile } from "~/features/resume/components/tiles/ResumeModelCondensedTile";

export default async function ExperiencesPage() {
  const fetcher = fetchExperiences([]);
  const { data: experiences } = await fetcher(
    {
      visibility: "public",
      filters: { highlighted: true },
    },
    { strict: true },
  );
  return (
    <>
      {experiences.map((experience, index) => (
        <ResumeModelCondensedTile
          model={experience}
          key={index}
          titleIsExpandable
          showTags={false}
          includeDescriptionShowMoreLink
        />
      ))}
    </>
  );
}
