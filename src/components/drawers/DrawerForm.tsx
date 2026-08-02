'use client';
import { type JSX } from 'react';

import { useWatch } from 'react-hook-form';
import { type PickByValueExact } from 'utility-types';

import { type BaseFormValues, type FieldName, type FormInstance } from '~/components/forms-v2';
import { classNames } from '~/components/types';
import { Title } from '~/components/typography';

import { ContextDrawer } from './ContextDrawer';

interface DrawerFormProps<I extends BaseFormValues> {
  readonly children: JSX.Element;
  readonly eagerTitle?: string;
  readonly form: FormInstance<I>;
  readonly titleField: FieldName<I> & keyof PickByValueExact<I, string>;
  readonly titlePlaceholder?: string;
}

export const DrawerForm = <I extends BaseFormValues>({
  children,
  eagerTitle,
  form,
  titleField,
  titlePlaceholder,
}: DrawerFormProps<I>): JSX.Element => {
  const _titleValue = useWatch({ control: form.control, name: titleField });
  const titleValue = typeof _titleValue === 'string' ? _titleValue : '';

  return (
    <ContextDrawer>
      <ContextDrawer.Header>
        {titleValue.trim().length === 0 && (eagerTitle || titlePlaceholder) ? (
          <Title
            className={classNames({ 'text-gray-300': titlePlaceholder !== undefined })}
            component='h4'
          >
            {titlePlaceholder ?? eagerTitle}
          </Title>
        ) : (
          <Title component='h4'>{titleValue}</Title>
        )}
      </ContextDrawer.Header>
      <ContextDrawer.Content className='overflow-y-hidden'>{children}</ContextDrawer.Content>
    </ContextDrawer>
  );
};
