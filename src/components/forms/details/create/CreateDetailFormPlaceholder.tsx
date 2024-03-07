import { Link } from "~/components/buttons";
import { TextInput } from "~/components/input/TextInput";

export const CreateDetailFormPlaceholder = (): JSX.Element => (
  <div className="flex flex-row justify-between items-center">
    <TextInput
      className="w-full p-0 outline-none"
      placeholder="Label"
      fontWeight="medium"
      size="small"
    />
    <Link.Primary
      options={{ as: "button" }}
      fontWeight="regular"
      type="submit"
      fontSize="xs"
      key="0"
    >
      Create
    </Link.Primary>
  </div>
);
