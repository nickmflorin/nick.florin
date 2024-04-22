import { getEducations } from "~/actions/fetches/educations";
import { ResumeModelTile } from "~/components/tiles/ResumeModelTile";

export default async function EducationsPage() {
  const educations = await getEducations({ visibility: "public", includes: [], limit: 5 });
  return (
    <div className="flex flex-col gap-[12px]">
      {educations.map((education, index) => (
        <ResumeModelTile key={index}>
          <ResumeModelTile.Header model={education} size="small" showBadges={false}>
            <ResumeModelTile.Title model={education} size="small" expandable />
            <ResumeModelTile.SubTitle model={education} size="small" />
          </ResumeModelTile.Header>
        </ResumeModelTile>
      ))}
    </div>
  );
}
