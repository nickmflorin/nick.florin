import { type BrandRepository } from "~/database/model";

import { NpmIconLink } from "~/components/buttons/NpmIconLink";
import { RepositoryLink } from "~/components/buttons/RepositoryLink";
import { type ComponentProps } from "~/components/types";
import { ResumeSimpleTile } from "~/features/resume/components/tiles/ResumeSimpleTile";

export interface RepositoryTileProps extends ComponentProps {
  readonly repository: BrandRepository;
}

export const RepositoryTile = ({ repository, ...props }: RepositoryTileProps) => (
  <ResumeSimpleTile
    {...props}
    icon={{ name: "github", iconStyle: "brands" }}
    iconClassName="text-github-black"
    description={repository.description}
    iconSize={28}
  >
    <RepositoryLink className="leading-[24px]" repository={repository} />
    {repository.npmPackageName && (
      <NpmIconLink size="24px" iconSize="24px" npmPackageName={repository.npmPackageName} />
    )}
  </ResumeSimpleTile>
);
