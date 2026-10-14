import { useSyncExternalStore } from 'react';

/** Tiny global store: screens hide the floating tab bar while a detail sheet is open. */
let tabBarHidden = false;
const listeners = new Set<() => void>();

export function setTabBarHidden(hidden: boolean) {
  if (hidden === tabBarHidden) return;
  tabBarHidden = hidden;
  listeners.forEach((l) => l());
}

export function useTabBarHidden() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => tabBarHidden
  );
}
