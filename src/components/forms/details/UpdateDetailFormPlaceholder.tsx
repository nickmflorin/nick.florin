import { Spinner } from "~/components/icons/Spinner";
import { TextInput } from "~/components/input/TextInput";

export const UpdateDetailFormPlaceholder = (): JSX.Element => (
  <div className="flex flex-row justify-between items-center">
    <TextInput
      className="w-full p-0 outline-none"
      placeholder="Label"
      fontWeight="medium"
      size="small"
    />
    <Spinner isLoading={true} size="16px" />
  </div>
);
