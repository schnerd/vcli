import {memo, useCallback} from 'react';
import Select, {Theme, ValueType} from 'react-select';
import {DataTypes} from '../types';
import {useSelectOption} from './use-select-option';

export interface FieldSelectOption {
  value: number;
  label: string;
  type: DataTypes;
}

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    boxShadow: state.isFocused
      ? provided.boxShadow
      : 'rgba(67,90,111,0.4) 0px 0px 1px, rgba(67,90,111,0.47) 0px 4px 5px -4px',
    borderColor: state.isFocused ? provided.borderColor : 'transparent',
  }),
};

export const selectTheme = (baseTheme: Theme): Theme => ({
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: 'var(--b9)',
    primary75: 'var(--b8)',
    primary50: 'var(--b6)',
    primary25: 'var(--b4)',
  },
});
export const selectComponents = {
  IndicatorSeparator: () => null,
};

export const selectStyleProps = {
  styles: selectStyles,
  theme: selectTheme,
  components: selectComponents,
};

interface Props {
  noOptionsMessage?: () => string;
  onChange: (value: number) => void;
  options: FieldSelectOption[];
  value: number;
}

export const FieldSelect = memo(function (props: Props) {
  const {noOptionsMessage, onChange, options, value} = props;

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
      onChange={handleChange}
      noOptionsMessage={noOptionsMessage}
      {...selectStyleProps}
    />
  );
});
