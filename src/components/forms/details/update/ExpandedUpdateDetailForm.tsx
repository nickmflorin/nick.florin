import { type ApiDetail, type NestedApiDetail } from "~/prisma/model";

import {
  GenericUpdateDetailForm,
  type GenericUpdateDetailFormProps,
} from "./GenericUpdateDetailForm";

export interface ExpandedUpdateDetailFormProps<D extends ApiDetail<[]> | NestedApiDetail<[]>>
  extends Omit<GenericUpdateDetailFormProps<D>, "actions"> {}

export const ExpandedUpdateDetailForm = <D extends ApiDetail<[]> | NestedApiDetail<[]>>(
  props: ExpandedUpdateDetailFormProps<D>,
): JSX.Element => <GenericUpdateDetailForm {...props} isScrollable={true} />;

export default ExpandedUpdateDetailForm;
