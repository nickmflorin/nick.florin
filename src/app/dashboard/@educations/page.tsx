import { getEducations } from "~/actions/fetches/educations";
import { ResumeModelTileHeader } from "~/components/tiles/ResumeModelTileHeader";

export default async function EducationsPage() {
  const educations = await getEducations({ visibility: "public", includes: [], limit: 5 });
  return (
    <div className="flex flex-col gap-[12px]">
      {educations.map((education, index) => (
        <ResumeModelTileHeader key={index} model={education} size="small" />
      ))}
    </div>
  );
}
