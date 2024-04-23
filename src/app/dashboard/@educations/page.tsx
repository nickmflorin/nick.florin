import { getEducations } from "~/actions/fetches/educations";
import { ResumeModelCondensedTile } from "~/components/tiles/resume/ResumeModelCondensedTile";

export default async function EducationsPage() {
  const educations = await getEducations({ visibility: "public", includes: [], limit: 5 });
  return (
    <div className="flex flex-col gap-[12px]">
      {educations.map((education, index) => (
        <ResumeModelCondensedTile key={index} model={education} expandable showBadges={false} />
      ))}
    </div>
  );
}
