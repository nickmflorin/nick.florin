import { UserProfile } from "@clerk/nextjs";

import { Dialog } from "~/components/dialogs/Dialog";

export interface UserProfileDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const UserProfileDialog = ({ isOpen, onClose }: UserProfileDialogProps) => (
  <Dialog.Provider isOpen={isOpen} onClose={onClose}>
    <Dialog className="user-profile-dialog">
      <Dialog.Close />
      <Dialog.Content>
        <UserProfile routing="hash" />
      </Dialog.Content>
    </Dialog>
  </Dialog.Provider>
);

export default UserProfileDialog;
