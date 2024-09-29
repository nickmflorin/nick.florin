import { type ApiDetail, type ApiNestedDetail } from "~/database/model";

import {
  GenericUpdateDetailForm,
  type GenericUpdateDetailFormProps,
} from "./GenericUpdateDetailForm";

export interface ExpandedUpdateDetailFormProps<
  D extends ApiDetail<["skills"]> | ApiNestedDetail<["skills"]>,
> extends Omit<GenericUpdateDetailFormProps<D>, "actions"> {}

export const ExpandedUpdateDetailForm = <
  D extends ApiDetail<["skills"]> | ApiNestedDetail<["skills"]>,
>(
  props: ExpandedUpdateDetailFormProps<D>,
): JSX.Element => <GenericUpdateDetailForm {...props} isScrollable={true} />;

export default ExpandedUpdateDetailForm;
