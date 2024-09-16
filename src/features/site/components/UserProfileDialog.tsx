import { UserProfile } from "@clerk/nextjs";

import { Dialog } from "~/components/dialogs/Dialog";
import { useUserProfile } from "~/hooks";

export interface UserProfileDialogProps {
  readonly isOpen: boolean;
}

export const UserProfileDialog = ({ isOpen }: UserProfileDialogProps) => {
  const { close } = useUserProfile();

  return (
    <Dialog.Provider isOpen={isOpen} onClose={() => close()}>
      <Dialog className="user-profile-dialog">
        <Dialog.Close />
        <Dialog.Content>
          <UserProfile routing="hash" />
        </Dialog.Content>
      </Dialog>
    </Dialog.Provider>
  );
};

export default UserProfileDialog;
