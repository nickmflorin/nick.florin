import clsx from "clsx";

import { IconButton } from "~/components/buttons";
import { DropdownMenu } from "~/components/menus/generic/DropdownMenu";

export const UploadResumeTileEllipsisMenu = () => (
  <DropdownMenu
    placement="bottom-end"
    width={400}
    options={{}}
    data={[{ label: "Set as Primary" }]}
    className="border"
  >
    <IconButton.Bare
      size="xsmall"
      icon={{ name: "ellipsis-h" }}
      className={clsx(
        "text-gray-500 hover:text-gray-600 disabled:text-gray-300",
        "h-[18px] w-[18px] min-h-[18px]",
      )}
    />
  </DropdownMenu>
);
