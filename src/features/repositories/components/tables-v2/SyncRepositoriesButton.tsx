"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { syncRepositories } from "~/actions-v2/repositories/sync-repositories";

import { Button } from "~/components/buttons";

export const SyncRepositoriesButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { refresh } = useRouter();
  const [isPending, transition] = useTransition();

  return (
    <Button.Solid
      isLoading={isLoading || isPending}
      scheme="secondary"
      onClick={async () => {
        setIsLoading(true);

        let response: Awaited<ReturnType<typeof syncRepositories>> | null = null;
        try {
          response = await syncRepositories();
        } catch (e) {
          logger.errorUnsafe(e, "There was an error syncing the repositories.");
          setIsLoading(false);
          return toast.error("There was an error syncing the repositories.");
        }
        const { error } = response;
        if (error) {
          logger.error(error, "There was an error syncing the repositories.");
          setIsLoading(false);
          return toast.error("There was an error syncing the repositories.");
        }
        transition(() => {
          refresh();
          setIsLoading(false);
          toast.success("Repositories synced successfully.");
        });
      }}
    >
      Sync
    </Button.Solid>
  );
};

export default SyncRepositoriesButton;
