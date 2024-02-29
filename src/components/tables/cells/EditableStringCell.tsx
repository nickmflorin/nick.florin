import { useEffect } from "react";

import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";

interface EditableStringCellProps {
  readonly value: string;
  readonly onPersist: (label: string) => void;
}

export const EditableStringCell = ({ value, onPersist }: EditableStringCellProps): JSX.Element => {
  const input = useReadWriteTextInput();

  useEffect(() => {
    input.current.setValue(value);
  }, [value, input]);

  return <ReadWriteTextInput ref={input} initialValue={value} onPersist={onPersist} />;
};

export default EditableStringCell;
