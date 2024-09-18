import dynamic from "next/dynamic";

import type { BrandResume } from "~/database/model";

import { IconButton } from "~/components/buttons";
import { Loading } from "~/components/loading/Loading";
import { DropdownMenu } from "~/components/menus/DropdownMenu";
import { classNames } from "~/components/types";
import type { UploadsManager } from "~/components/uploads";

const UploadResumeMenu = dynamic(
  () => import("./UploadResumeMenu").then(mod => mod.UploadResumeMenu),
  { loading: () => <Loading isLoading /> },
);

export interface UploadResumeDropdownMenuProps {
  readonly manager: UploadsManager<BrandResume>;
  readonly resume: BrandResume;
}

export const UploadResumeDropdownMenu = ({ manager, resume }: UploadResumeDropdownMenuProps) => (
  <DropdownMenu
    placement="bottom-end"
    width={160}
    // Force lazy/dynamic loading of the content with the boolean toggle.
    content={({ isOpen, setIsOpen }) =>
      isOpen ? (
        <div className="flex flex-col relative min-h-[60px]">
          <UploadResumeMenu onClose={e => setIsOpen(false, e)} manager={manager} resume={resume} />
        </div>
      ) : (
        <></>
      )
    }
  >
    <IconButton.Transparent
      size="xsmall"
      scheme="light"
      icon={{ name: "ellipsis-h" }}
      className={classNames(
        "text-gray-500 hover:text-gray-600 disabled:text-gray-300",
        "h-[18px] w-[18px] min-h-[18px]",
      )}
    />
  </DropdownMenu>
);
