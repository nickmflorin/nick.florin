import clsx from "clsx";

import { type BrandRepository } from "~/prisma/model";
import { RepositoryLink } from "~/components/buttons/RepositoryLink";
import { Icon } from "~/components/icons/Icon";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography/Description";

export interface RepositoryTileProps extends ComponentProps {
  readonly repository: BrandRepository;
}

export const RepositoryTile = ({ repository, ...props }: RepositoryTileProps) => (
  <div
    {...props}
    className={clsx("flex flex-row gap-[12px] max-w-full w-full overflow-hidden", props.className)}
  >
    <Icon className="text-github-black" name="github" iconStyle="brands" size={28} />
    <div className={clsx("flex flex-col gap-[4px] overflow-hidden")}>
      <RepositoryLink repository={repository} />
      <Description description={repository.description} className="text-body-light" fontSize="xs" />
    </div>
  </div>
);
