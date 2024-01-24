import clsx from "clsx";

import { ExperienceImage } from "~/components/images/ExperienceImage";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";
import { type Company, type Experience } from "~/prisma/model";

export interface ExperienceTileProps extends ComponentProps {
  readonly experience: Experience & { readonly company: Company };
}

export const ExperienceTile = ({ experience, ...props }: ExperienceTileProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col w-full gap-[6px]", props.className)}>
    <div className="flex flex-row gap-[8px]">
      <ExperienceImage size={60} image={{ url: experience.company.logoImageUrl }} />
      <div className="flex flex-col gap-[6px] h-[60px] pt-[4px]">
        <Title order={4}>{experience.title}</Title>
        <Title order={5}>{experience.company.name}</Title>
      </div>
    </div>
  </div>
);
