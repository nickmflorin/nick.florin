import { type BrandRepository } from "~/database/model";

import { NpmIconLink } from "~/components/buttons/NpmIconLink";
import { RepositoryLink } from "~/components/buttons/RepositoryLink";
import { type ComponentProps } from "~/components/types";
import { RepositoryText } from "~/features/repositories/components/RepositoryText";
import {
  ResumeSimpleTile,
  type ResumeSimpleTileProps,
} from "~/features/resume/components/tiles/ResumeSimpleTile";

export interface RepositoryTileProps
  extends Pick<ResumeSimpleTileProps, keyof ComponentProps | "iconSize"> {
  readonly repository: BrandRepository;
  readonly includeLink?: boolean;
  readonly includeDescription?: boolean;
  readonly includeNpmLink?: boolean;
}

export const RepositoryTile = ({
  repository,
  includeLink = true,
  includeDescription = true,
  includeNpmLink = true,
  ...props
}: RepositoryTileProps) => (
  <ResumeSimpleTile
    iconSize={28}
    {...props}
    icon={{ name: "github", iconStyle: "brands" }}
    iconClassName="text-github-black"
    description={includeDescription ? repository.description : null}
  >
    {includeLink ? (
      <RepositoryLink className="leading-[24px]" repository={repository} />
    ) : (
      <RepositoryText className="leading-[24px]" repository={repository} />
    )}
    {repository.npmPackageName && includeNpmLink && (
      <NpmIconLink size="24px" iconSize="24px" npmPackageName={repository.npmPackageName} />
    )}
  </ResumeSimpleTile>
);
