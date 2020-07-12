import {useMemo} from 'react';

// Wrapper around local storage API
const windowLs = typeof window === 'undefined' ? null : window.localStorage;

export class LocalStorage {
  static setItem(name: string, value: string) {
    if (!windowLs) {
      throw new Error('You cannot set localStorage server-side');
    }
    windowLs.setItem(name, value);
  }
  static getItem(name: string): string | null {
    if (windowLs) {
      return windowLs.getItem(name);
    }
    return null;
  }
  static removeItem(name: string) {
    if (windowLs) {
      return windowLs.removeItem(name);
    }
  }
}

type LocalStorageSetter = (value: string) => void;
export function useLocalStorage(key: string): [string | null, LocalStorageSetter] {
  const value = useMemo(() => LocalStorage.getItem(key), [key]);
  const setter = useMemo(() => (value: string) => LocalStorage.setItem(key, value), [key]);
  return [value, setter];
}
