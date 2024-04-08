import { type ApiSkill } from "~/prisma/model";
import { ResumeTileHeader } from "~/components/tiles/ResumeTileHeader";
import { Label } from "~/components/typography/Label";

export const Educations = ({
  educations,
}: {
  educations: ApiSkill<["educations"]>["educations"];
}) => (
  <div className="flex flex-col gap-[10px]">
    <Label size="sm" fontWeight="medium">
      Education
    </Label>
    <div className="flex flex-col gap-[12px]">
      {educations.map((education, index) => (
        <ResumeTileHeader model={education} size="small" key={index} />
      ))}
    </div>
  </div>
);

export default Educations;
