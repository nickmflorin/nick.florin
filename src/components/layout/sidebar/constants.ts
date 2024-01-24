export const ParentItemBottomMargin = 6;
export const ChildItemGap = 4;
export const ItemHeight = 48;

export const calculateChildItemOffsetY = (index: number) =>
  ItemHeight * index + (index - 1) * ChildItemGap;

export const calculateItemGroupHeight = <T>(
  children: T[],
  { isOpen }: { isOpen: boolean },
): number => 5;
