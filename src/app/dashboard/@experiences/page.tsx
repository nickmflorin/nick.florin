import { getExperiences } from "~/actions/fetches/experiences";
import { ResumeModelCondensedTile } from "~/components/tiles/resume/ResumeModelCondensedTile";

export default async function ExperiencesPage() {
  const experiences = await getExperiences({ visibility: "public", includes: [], limit: 5 });
  return (
    <div className="flex flex-col gap-[12px]">
      {experiences.map((experience, index) => (
        <ResumeModelCondensedTile
          model={experience}
          key={index}
          expandable
          showBadges={false}
          showMoreLink
        />
      ))}
    </div>
  );
}
