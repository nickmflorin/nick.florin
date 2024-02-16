import { type IconProp } from "~/components/icons";

export type Action = IconProp | JSX.Element | null | undefined;

export type ActionsBySide =
  | { left?: Action[]; right: Action[] }
  | { left: Action[]; right?: Action[] };

export type ActionsType = Action[] | ActionsBySide;

export const isActionsBySide = (actions: ActionsType): actions is ActionsBySide =>
  !Array.isArray(actions);

export const mergeActions = (
  a: ActionsType | undefined,
  b: ActionsType | undefined,
): ActionsType => {
  if (!a) {
    return b ?? [];
  } else if (!b) {
    return a ?? [];
  } else if (isActionsBySide(a) && !isActionsBySide(b)) {
    return { left: [...(a.left ?? []), ...b], right: a.right };
  } else if (!isActionsBySide(a) && isActionsBySide(b)) {
    return { left: [...a, ...(b.left ?? [])], right: b.right };
  } else if (isActionsBySide(a) && isActionsBySide(b)) {
    return {
      left: [...(a.left ?? []), ...(b.left ?? [])],
      right: [...(a.right ?? []), ...(b.right ?? [])],
    };
  }
  /* Apparently, TS exhaustive type checking doesn't work in this case - but it should.  At this
     point, we know that both 'a' and 'b' are arrays of Action(s), not ActionsBySide. */
  return [...(a as Action[]), ...(b as Action[])];
};
