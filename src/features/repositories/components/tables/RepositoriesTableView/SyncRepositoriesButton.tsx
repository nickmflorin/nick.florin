"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";

import { syncRepositories } from "~/actions/mutations/repositories";

import { Button } from "~/components/buttons";

export const SyncRepositoriesButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { refresh } = useRouter();

  return (
    <Button.Secondary
      isLoading={isLoading}
      onClick={async () => {
        setIsLoading(true);
        let success = true;
        try {
          await syncRepositories();
        } catch (e) {
          success = false;
          logger.error(`There was an error syncing the repositories:\n${e}`);
          toast.error("There was an error syncing the repositories.");
        } finally {
          setIsLoading(false);
        }
        if (success) {
          refresh();
        }
      }}
    >
      Sync
    </Button.Secondary>
  );
};

export default SyncRepositoriesButton;
