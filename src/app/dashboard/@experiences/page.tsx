import { getExperiences } from "~/actions/fetches/experiences";
import { ResumeModelTile } from "~/components/tiles/ResumeModelTile";

export default async function ExperiencesPage() {
  const experiences = await getExperiences({ visibility: "public", includes: [], limit: 5 });
  return (
    <div className="flex flex-col gap-[12px]">
      {experiences.map((experience, index) => (
        <ResumeModelTile key={index}>
          <ResumeModelTile.Header model={experience} size="small" showBadges={false}>
            <ResumeModelTile.Title model={experience} size="small" expandable />
            <ResumeModelTile.SubTitle model={experience} size="small" />
          </ResumeModelTile.Header>
        </ResumeModelTile>
      ))}
    </div>
  );
}
