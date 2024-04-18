import { getExperiences } from "~/actions/fetches/experiences";
import { ResumeModelTileHeader } from "~/components/tiles/ResumeModelTileHeader";

export default async function ExperiencesPage() {
  const experiences = await getExperiences({ visibility: "public", includes: [], limit: 5 });
  return (
    <div className="flex flex-col gap-[12px]">
      {experiences.map((experience, index) => (
        <ResumeModelTileHeader key={index} model={experience} size="small" />
      ))}
    </div>
  );
}
