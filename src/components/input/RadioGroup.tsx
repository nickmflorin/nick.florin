import { Radio } from "./Radio";

type RadioGroupValue = string | number | readonly string[];

type RadioGroupDatum<V extends RadioGroupValue> = {
  readonly value: V;
  readonly label: string;
};

export interface RadioGroupProps<T extends RadioGroupDatum<RadioGroupValue>> {
  readonly data: T[];
  readonly value: T["value"];
  readonly onChange: (v: T["value"]) => void;
}

export const RadioGroup = <T extends RadioGroupDatum<RadioGroupValue>>({
  data,
  value,
  onChange,
}: RadioGroupProps<T>) => (
  <div className="flex flex-row gap-[10px]">
    {data.map(({ value: radioValue, label }, i) => (
      <Radio
        key={i}
        value={value}
        onClick={e => onChange(radioValue)}
        checked={radioValue === value}
      >
        {label}
      </Radio>
    ))}
  </div>
);
