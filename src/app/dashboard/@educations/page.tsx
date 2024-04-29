import { getEducations } from "~/actions/fetches/educations";
import { ResumeModelCondensedTile } from "~/components/tiles/resume/ResumeModelCondensedTile";

export default async function EducationsPage() {
  const educations = await getEducations({ visibility: "public", includes: [], limit: 5 });
  return (
    <>
      {educations.map((education, index) => (
        <ResumeModelCondensedTile
          model={education}
          key={index}
          expandable
          showBadges={false}
          showMoreLink
        />
      ))}
    </>
  );
}
