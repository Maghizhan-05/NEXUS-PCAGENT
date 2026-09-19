import { useCallback, useState } from "react";

/** Per-card collapsed state, persisted per viewer so plates stay how you left them. */
export function useCardState(key: string, initial = false) {
  const storageKey = `nexus.card.${key}`;
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw == null ? initial : raw === "1";
    } catch {
      return initial;
    }
  });

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [storageKey]);

  return { collapsed, toggle };
}
