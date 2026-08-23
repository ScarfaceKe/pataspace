'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export function usePersistentMatchState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = window.sessionStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Session storage can fail in private mode; search still works with React state.
    }
  }, [key, value]);

  function reset() {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
    setValue(initialValue);
  }

  return [value, setValue, reset];
}
