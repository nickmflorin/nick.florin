'use client';
import { type LabeledNavItem } from '~/application/pages';

import { TabButton } from '~/components/buttons/TabButton';
import { useNavigationItem } from '~/hooks';

export interface TabProps {
  readonly item: LabeledNavItem;
}

export const Tab = ({ item }: TabProps) => {
  const { href, isActive, isPending, setNavigating } = useNavigationItem(item);
  return (
    <TabButton
      element='link'
      href={href}
      icon={item.icon}
      isActive={isActive}
      isPending={isPending}
      onClick={() => setNavigating()}
    >
      {item.label}
    </TabButton>
  );
};
