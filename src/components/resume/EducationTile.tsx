import clsx from "clsx";

import { EducationImage } from "~/components/images/EducationImage";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";
import { getDegreeData } from "~/prisma/enums";
import { type School, type Education } from "~/prisma/model";

export interface EducationTileProps extends ComponentProps {
  readonly education: Education & { readonly school: School };
}

export const EducationTile = ({ education, ...props }: EducationTileProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col w-full gap-[6px] max-w-[400px]", props.className)}>
    <div className="flex flex-row gap-[8px]">
      <EducationImage size={60} image={{ url: education.school.logoImageUrl }} />
      <div className="flex flex-col gap-[6px] h-[60px] pt-[4px]">
        <Title order={4}>{`${getDegreeData(education.degree).abbreviatedLabel} in ${
          education.major
        }`}</Title>
        <Title order={5}>{education.school.name}</Title>
      </div>
    </div>
  </div>
);
