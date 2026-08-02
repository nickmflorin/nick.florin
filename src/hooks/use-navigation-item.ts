import { useCallback, useMemo } from 'react';

import { type NavItem } from '~/application/pages';

import { useNavigation } from './use-navigation';

export const useNavigationItem = <N extends Pick<NavItem, 'activePaths' | 'path'>>(item: N) => {
  const {
    isActive: _isActive,
    isPending: _isPending,
    setNavigating: _setNavigating,
  } = useNavigation();

  const isPending = useMemo(() => _isPending(item), [item, _isPending]);

  const isActive = useMemo(() => _isActive(item), [item, _isActive]);

  const setNavigating = useCallback(() => {
    _setNavigating(item);
  }, [item, _setNavigating]);

  return {
    href: item.path,
    isActive,
    isPending,
    setNavigating,
  };
};
