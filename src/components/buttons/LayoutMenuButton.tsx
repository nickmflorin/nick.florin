'use client';
import { IconButton } from '~/components/buttons';
import { useNavMenu } from '~/hooks';

export const LayoutMenuButton = () => {
  const { isOpen, toggle } = useNavMenu();
  return (
    <IconButton.Solid
      className='hidden max-xs:flex'
      element='button'
      icon={{ name: 'bars' }}
      isActive={isOpen}
      onClick={() => toggle()}
      scheme='secondary'
    />
  );
};
