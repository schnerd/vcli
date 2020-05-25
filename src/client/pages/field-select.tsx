import {memo, useCallback} from 'react';
import Select, {Theme, ValueType} from 'react-select';
import {DataTypes} from './data-container';
import {useSelectOption} from './use-select-option';

export interface FieldSelectOption {
  value: number;
  label: string;
  type: DataTypes;
}

export const selectTheme = (baseTheme: Theme): Theme => ({
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: 'var(--n9)',
    primary75: 'var(--n8)',
    primary50: 'var(--n6)',
    primary25: 'var(--n4)',
  },
});
export const selectComponents = {
  IndicatorSeparator: () => null,
};

interface Props {
  onChange: (value: number) => void;
  options: FieldSelectOption[];
  value: number;
}

export const FieldSelect = memo(function FieldSelect(props: Props) {
  const {onChange, options, value} = props;

  const valueOption = useSelectOption(options, value);
  const handleChange = useCallback(
    (value: ValueType<FieldSelectOption>) => {
      if (value) {
        onChange((value as FieldSelectOption).value);
      }
    },
    [onChange],
  );

  return (
    <Select
      options={options}
      value={valueOption}
      placeholder="Select field"
      theme={selectTheme}
      components={selectComponents}
      onChange={handleChange}
    />
  );
});
