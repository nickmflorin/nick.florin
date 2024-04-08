import { type ApiSkill } from "~/prisma/model";
import { ResumeTileHeader } from "~/components/tiles/ResumeTileHeader";
import { Label } from "~/components/typography/Label";

export const Experiences = ({
  experiences,
}: {
  experiences: ApiSkill<["experiences"]>["experiences"];
}) => (
  <div className="flex flex-col gap-[10px]">
    <Label size="sm" fontWeight="medium">
      Experience
    </Label>
    <div className="flex flex-col gap-[12px]">
      {experiences.map((experience, index) => (
        <ResumeTileHeader key={index} model={experience} size="small" />
      ))}
    </div>
  </div>
);

export default Experiences;
