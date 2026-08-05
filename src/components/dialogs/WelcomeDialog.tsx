import { useCookies } from 'next-client-cookies';

import { Button } from '~/components/buttons';
import { SuppressTourCookie } from '~/components/tours/use-tour';
import { Text } from '~/components/typography';

import { Dialog } from './Dialog';

export interface WelcomeDialogProps {
  readonly error: null | string;
  readonly isOpen: boolean;
  readonly isWaitingForTour: boolean;
  readonly onClose: () => void;
  readonly onStart: () => void;
}

export const WelcomeDialog = ({
  error,
  isOpen,
  isWaitingForTour,
  onClose,
  onStart,
}: WelcomeDialogProps) => {
  const cookies = useCookies();

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog className='w-[500px]'>
        <Dialog.Close />
        <Dialog.Title>Welcome to my Personal Portfolio!</Dialog.Title>
        <Dialog.Content>
          <Dialog.Description>
            I hope you get a chance to take a look around, but first - a few quick things to help
            you find your way...
          </Dialog.Description>
        </Dialog.Content>
        <Dialog.Footer>
          <div className='flex flex-col gap-[8px]'>
            <div className='flex flex-row items-center gap-[8px]'>
              <Button.Solid
                className='flex-1'
                onClick={() => {
                  cookies.set(SuppressTourCookie, 'true');
                  onClose();
                }}
                scheme='secondary'
              >
                Skip and don&apos;t ask again
              </Button.Solid>
              <Button.Solid className='flex-1' onClick={onClose} scheme='secondary'>
                Skip for now
              </Button.Solid>
              <Button.Solid
                className='flex-1'
                isLoading={isWaitingForTour}
                onClick={() => onStart()}
                scheme='primary'
              >
                Next
              </Button.Solid>
            </div>
            {error ? (
              <Text className='text-danger-700' fontSize='xs'>
                {error}
              </Text>
            ) : null}
          </div>
        </Dialog.Footer>
      </Dialog>
    </Dialog.Root>
  );
};
