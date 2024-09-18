import { type ApiDetail, type NestedApiDetail } from "~/database/model";

import {
  GenericUpdateDetailForm,
  type GenericUpdateDetailFormProps,
} from "./GenericUpdateDetailForm";

export interface ExpandedUpdateDetailFormProps<
  D extends ApiDetail<["skills"]> | NestedApiDetail<["skills"]>,
> extends Omit<GenericUpdateDetailFormProps<D>, "actions"> {}

export const ExpandedUpdateDetailForm = <
  D extends ApiDetail<["skills"]> | NestedApiDetail<["skills"]>,
>(
  props: ExpandedUpdateDetailFormProps<D>,
): JSX.Element => <GenericUpdateDetailForm {...props} isScrollable={true} />;

export default ExpandedUpdateDetailForm;
