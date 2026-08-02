import { useRouter } from 'next/navigation';
import { type JSX, useMemo, useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiDetail, type ApiNestedDetail, isNestedDetail } from '~/database/model';
import { logger } from '~/internal/logger';

import { deleteDetail } from '~/actions/details/delete-detail';
import { deleteNestedDetail } from '~/actions/details/delete-nested-detail';

import { IconButton } from '~/components/buttons';
import { DetailVisibilityButton } from '~/components/buttons/DetailVisibilityButton';

import {
  GenericUpdateDetailForm,
  type GenericUpdateDetailFormProps,
} from './GenericUpdateDetailForm';

export interface CollapsedUpdateDetailFormProps<
  D extends ApiDetail<['skills']> | ApiNestedDetail<['skills']>,
> extends GenericUpdateDetailFormProps<D> {
  readonly onDeleted: () => void;
  readonly onExpand: () => void;
}

export const CollapsedUpdateDetailForm = <
  D extends ApiDetail<['skills']> | ApiNestedDetail<['skills']>,
>({
  onDeleted,
  onExpand,
  ...props
}: CollapsedUpdateDetailFormProps<D>): JSX.Element => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [_, transition] = useTransition();
  const router = useRouter();

  const deleteDetailWithId = useMemo(
    () =>
      isNestedDetail(props.detail)
        ? deleteNestedDetail.bind(null, props.detail.id)
        : deleteDetail.bind(null, props.detail.id),
    [props.detail],
  );

  return (
    <GenericUpdateDetailForm
      {...props}
      actions={[
        ...(props.actions ?? []),
        <IconButton.Transparent
          className='text-gray-600 hover:text-gray-700'
          icon={{ name: 'up-right-and-down-left-from-center' }}
          key='0'
          onClick={() => onExpand()}
          size='xsmall'
        />,
        <DetailVisibilityButton<D> detail={props.detail} key='1' />,
        <IconButton.Transparent
          className='text-red-600 hover:text-red-700'
          icon={{ name: 'trash-alt' }}
          isLoading={isDeleting}
          key='2'
          onClick={async () => {
            setIsDeleting(true);
            let response: Awaited<ReturnType<typeof deleteDetailWithId>> | null = null;
            try {
              response = await deleteDetailWithId();
            } catch (e) {
              logger.errorUnsafe(
                e,
                `There was an error deleting the detail with ID '${props.detail.id}'.`,
                { detail: props.detail },
              );
              setIsDeleting(false);
              return toast.error('There was an error updating the detail.');
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error deleting the detail with ID '${props.detail.id}'.`,
                { detail: props.detail },
              );
              setIsDeleting(false);
              return toast.error('There was an error deleting the detail.');
            }
            transition(() => {
              router.refresh();
              setIsDeleting(false);
              onDeleted();
            });
          }}
          size='xsmall'
        />,
      ]}
      footerClassName='mt-0'
      isScrollable={false}
    />
  );
};
