import {useMemo} from 'react';

export function useSelectOption<V, O extends {value: V}>(options: O[], value: V): O | null {
  return useMemo(() => {
    return options.find((o) => o.value === value) || null;
  }, [options, value]);
}
