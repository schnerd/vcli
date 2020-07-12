import {useCallback, useState} from 'react';

export function useForceUpdate() {
  const [, updateState] = useState({});
  const cb = useCallback(() => updateState({}), []);
  return cb;
}
