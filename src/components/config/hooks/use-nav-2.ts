export {};
/* import { usePathname } from "next/navigation";
   import { useState, useCallback, useEffect } from "react"; */

// import { pathIsActive, type NavItem } from "~/application/pages";

/* import { type GlobalNavigatableContext } from "~/components/config/types";
   import { useDebouncedValue } from "~/hooks"; */

/* export const useGlobalNavigatableContext = (): Omit<GlobalNavigatableContext, "isInScope"> => {
     const [optimisticallyActiveNavigation, setOptimisticActiveNavigation] = useState<string |
     null>(
       null,
     );
     const [_pendingNavigation, setPendingNavigation] = useState<string | null>(null); */

/*   const isOptimisticallyActive = useCallback(
       (ids: string | string[]) =>
         Array.isArray(ids)
           ? optimisticallyActiveNavigation && ids.includes(optimisticallyActiveNavigation)
           : optimisticallyActiveNavigation === ids,
       [optimisticallyActiveNavigation],
     ); */

//   const pathname = usePathname();

//   /* const isOptimisticallyActive = useMemo(
//        () => _isOptimisticallyActive(id),
//        [id, _isOptimisticallyActive],
//      ); */

/*   // An active state that is determined solely from the pathname.  This is the "real" active\
// state.
     const isActive = useCallback(
       (item: Pick<NavItem, "activePaths">) =>
         pathname ? pathIsActive(item.activePaths, pathname) : false,
       [pathname],
     ); */

//   /* When the "real" active state differs from the optimistic one, it means that the navigatable
//      element has just been clicked but the navigation hasn't completed yet.  The delay of 200ms
// is
//      to prevent flashing loading indicators from appearing when the navigation is immediate. */
//   const [pendingNavigation] = useDebouncedValue(_pendingNavigation, 200);

//   // const [isPending] = useDebouncedValue(isOptimisticallyActive && !isActive, 200);

//   // useEffect(() => {
//   //   if (isOptimisticallyActive) {
//   //     /* Keep the optimistic active state in sync with the real active state after the
// navigation
//   //        occurs. */
//   //     setOptimisticActiveNavigation(null);
//   //   }
//   //   /* eslint-disable-next-line react-hooks/exhaustive-deps */
//   // }, [pathname]);

//   const setActiveOptimistically = useCallback(
//     (item: Pick<NavItem, "activePaths" | "path">) => {
//       if (!isActive(item)) {
//         setOptimisticActiveNavigation(item.path);
//       } else {
//         /* If the clicked element is already active, then we need to set the global
// optimistically
//            active element to null.  This is because if an already active element is clicked, and
//            there is another element that is pending, we need to remove the pending state from the
//            pending element because the page navigation will not transition to the path associated
//            with the pending element (it will in effect be cancelled, and the navigation will
//remain
//            on the existing page).  If we did not do this, then we would wind up with an infinite
//            loading indicator on the previously pending element, because the pathname would not
//            change and the pending element would never "finish" pending. */
//         setOptimisticActiveNavigation(null);
//       }
//     },
//     [isActive, setOptimisticActiveNavigation],
//   );

/*   return {
       optimisticallyActiveNavigation,
       setOptimisticActiveNavigation,
       isOptimisticallyActive,
     };
   }; */
