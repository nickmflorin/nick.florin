import { getExperiences } from "~/actions/fetches/experiences";
import { ResumeModelCondensedTile } from "~/components/tiles/resume/ResumeModelCondensedTile";

export default async function ExperiencesPage() {
  const experiences = await getExperiences({
    visibility: "public",
    includes: [],
    filters: { highlighted: true },
  });
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
