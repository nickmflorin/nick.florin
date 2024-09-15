import { getEducations } from "~/actions/fetches/educations";

import { ResumeModelCondensedTile } from "~/features/resume/components/tiles/ResumeModelCondensedTile";

export default async function EducationsPage() {
  const educations = await getEducations({
    visibility: "public",
    includes: [],
    filters: { highlighted: true },
  });
  return (
    <>
      {educations.map((education, index) => (
        <ResumeModelCondensedTile
          model={education}
          key={index}
          titleIsExpandable
          showTags={false}
          includeDescriptionShowMoreLink
        />
      ))}
    </>
  );
}
