import { type IconProp } from "~/components/icons";

export type Action = IconProp | JSX.Element | null | undefined;

export type ActionsBySide =
  | { left?: Action[]; right: Action[] }
  | { left: Action[]; right?: Action[] };

export type ActionsType = Action[] | ActionsBySide;

export const isActionsBySide = <A extends ActionsType>(actions: A): actions is A & ActionsBySide =>
  !Array.isArray(actions);

type MergedActions<A extends ActionsType, B extends ActionsType> = A extends ActionsBySide
  ? ActionsBySide
  : B extends ActionsBySide
    ? ActionsBySide
    : Action[];

export const mergeActions = <A extends ActionsType, B extends ActionsType>(
  a: A | undefined,
  b: B | undefined,
): MergedActions<A, B> => {
  if (!a) {
    return (b ?? []) as MergedActions<A, B>;
  } else if (!b) {
    return (a ?? []) as MergedActions<A, B>;
  } else if (isActionsBySide(a) && !isActionsBySide(b)) {
    return { left: [...(a.left ?? []), ...(b as Action[])], right: a.right } as MergedActions<A, B>;
  } else if (!isActionsBySide(a) && isActionsBySide(b)) {
    return { left: [...(a as Action[]), ...(b.left ?? [])], right: b.right } as MergedActions<A, B>;
  } else if (isActionsBySide(a) && isActionsBySide(b)) {
    return {
      left: [...(a.left ?? []), ...(b.left ?? [])],
      right: [...(a.right ?? []), ...(b.right ?? [])],
    } as MergedActions<A, B>;
  }
  /* Apparently, TS exhaustive type checking doesn't work in this case - but it should.  At this
     point, we know that both 'a' and 'b' are arrays of Action(s), not ActionsBySide. */
  return [...(a as Action[]), ...(b as Action[])] as MergedActions<A, B>;
};
