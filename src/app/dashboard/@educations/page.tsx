import { fetchEducations } from "~/actions-v2/educations/fetch-educations";

import { ResumeModelCondensedTile } from "~/features/resume/components/tiles/ResumeModelCondensedTile";

export default async function EducationsPage() {
  const fetcher = fetchEducations([]);
  const { data: educations } = await fetcher(
    {
      visibility: "public",
      filters: { highlighted: true },
    },
    { strict: true },
  );
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
