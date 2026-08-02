'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { syncRepositories } from '~/actions/repositories/sync-repositories';

import { Button } from '~/components/buttons';

export const SyncRepositoriesButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isPending, transition] = useTransition();

  return (
    <Button.Solid
      isLoading={isLoading || isPending}
      onClick={async () => {
        setIsLoading(true);

        let response: Awaited<ReturnType<typeof syncRepositories>> | null = null;
        try {
          response = await syncRepositories();
        } catch (e) {
          logger.errorUnsafe(e, 'There was an error syncing the repositories.');
          setIsLoading(false);
          return toast.error('There was an error syncing the repositories.');
        }
        const { error } = response;
        if (error) {
          logger.error(error, 'There was an error syncing the repositories.');
          setIsLoading(false);
          return toast.error('There was an error syncing the repositories.');
        }
        transition(() => {
          router.refresh();
          setIsLoading(false);
          toast.success('Repositories synced successfully.');
        });
      }}
      scheme='secondary'
    >
      Sync
    </Button.Solid>
  );
};
