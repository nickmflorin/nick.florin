import { type BrandRepository } from "~/database/model";

import { NpmIconLink } from "~/components/buttons/NpmIconLink";
import { RepositoryLink } from "~/components/buttons/RepositoryLink";
import { type ComponentProps } from "~/components/types";
import { RepositoryText } from "~/features/repositories/components/RepositoryText";
import { ResumeSimpleTile } from "~/features/resume/components/tiles/ResumeSimpleTile";

export interface RepositoryTileProps extends ComponentProps {
  readonly repository: BrandRepository;
  readonly includeLink?: boolean;
  readonly includeDescription?: boolean;
}

export const RepositoryTile = ({
  repository,
  includeLink = true,
  includeDescription = true,
  ...props
}: RepositoryTileProps) => (
  <ResumeSimpleTile
    {...props}
    icon={{ name: "github", iconStyle: "brands" }}
    iconClassName="text-github-black"
    description={includeDescription ? repository.description : null}
    iconSize={28}
  >
    {includeLink ? (
      <RepositoryLink className="leading-[24px]" repository={repository} />
    ) : (
      <RepositoryText className="leading-[24px]" repository={repository} />
    )}
    {repository.npmPackageName && (
      <NpmIconLink size="24px" iconSize="24px" npmPackageName={repository.npmPackageName} />
    )}
  </ResumeSimpleTile>
);
