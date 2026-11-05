"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Copyright year that stays current without rebuilding. Cache Components forbids
 * reading the clock in the prerendered shell, so the HTML carries a fallback year
 * and the browser swaps in the real one on load.
 */
export default function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => 2026,
  );
  return <>{year}</>;
}
