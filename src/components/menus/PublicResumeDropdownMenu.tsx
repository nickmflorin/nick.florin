"use client";
import type { BrandResume } from "~/prisma/model";
import { Button } from "~/components/buttons";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { DropdownMenu } from "~/components/menus/generic/DropdownMenu";

export interface UploadResumeTileEllipsisMenuProps {
  readonly resume: BrandResume;
}

export const PublicResumeDownloadMenu = ({ resume }: UploadResumeTileEllipsisMenuProps) => (
  <DropdownMenu
    placement="bottom-end"
    itemHeight="34px"
    width={160}
    options={{}}
    className="border"
    data={[
      {
        label: "Download",
        icon: { name: "download" },
        href: resume.downloadUrl,
      },
      {
        label: "View",
        icon: { name: "window" },
        href: { url: resume.url, target: "_blank", rel: "noopener noreferrer" },
      },
    ]}
  >
    {({ ref, params, isOpen }) => (
      <Button.Secondary {...params} ref={ref} icon={{ right: <CaretIcon open={isOpen} /> }}>
        Resume
      </Button.Secondary>
    )}
  </DropdownMenu>
);
