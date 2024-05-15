import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";
import type * as types from "~/components/menus";

const MenuComponentContent = dynamic(() => import("./MenuComponentContent"), {
  loading: () => <Loading isLoading={true} />,
});

const MenuDataContent = dynamic(() => import("./MenuDataContent"), {
  loading: () => <Loading isLoading={true} />,
}) as {
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    props: types.MenuDataContentProps<M, O>,
  ): JSX.Element;
};

export const MenuContent = <M extends types.MenuModel, O extends types.MenuOptions<M>>(
  props: types.MenuContentProps<M, O>,
): JSX.Element =>
  props.data ? (
    <MenuDataContent {...props}>{props.children}</MenuDataContent>
  ) : (
    <MenuComponentContent {...props}>{props.children}</MenuComponentContent>
  );

export default MenuContent;
