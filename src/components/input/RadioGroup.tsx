import { Radio } from './Radio';

type RadioGroupValue = number | readonly string[] | string;

type RadioGroupDatum<V extends RadioGroupValue> = {
  readonly label: string;
  readonly value: V;
};

export interface RadioGroupProps<T extends RadioGroupDatum<RadioGroupValue>> {
  readonly data: T[];
  readonly onChange: (v: T['value']) => void;
  readonly value: T['value'];
}

export const RadioGroup = <T extends RadioGroupDatum<RadioGroupValue>>({
  data,
  onChange,
  value,
}: RadioGroupProps<T>) => (
  <div className='flex flex-row gap-[10px]'>
    {data.map(({ label, value: radioValue }, i) => (
      <Radio
        checked={radioValue === value}
        key={i}
        onClick={() => onChange(radioValue)}
        value={value}
      >
        {label}
      </Radio>
    ))}
  </div>
);
