import { useCallback, useEffect, useState } from "react";

const KEY = "nexus.displayScale";
export const SCALE_STEPS = [0.9, 1, 1.1, 1.25] as const;
export type Scale = (typeof SCALE_STEPS)[number];

function load(): Scale {
  try {
    const raw = Number(localStorage.getItem(KEY));
    if (SCALE_STEPS.includes(raw as Scale)) return raw as Scale;
  } catch {
    /* private mode / blocked storage */
  }
  return 1;
}

/**
 * Density control for the dashboard. This is a *polish* layer on top of an
 * already-responsive layout — it scales visual density, it does not fix
 * reflow. The value is applied as a CSS variable and persisted per viewer.
 */
export function useDisplayScale() {
  const [scale, setScaleState] = useState<Scale>(load);

  useEffect(() => {
    document.documentElement.style.setProperty("--nexus-scale", String(scale));
    try {
      localStorage.setItem(KEY, String(scale));
    } catch {
      /* ignore */
    }
  }, [scale]);

  const setScale = useCallback((s: Scale) => setScaleState(s), []);

  return { scale, setScale };
}

export function useFullscreen() {
  const [supported] = useState(
    () => typeof document !== "undefined" && !!document.documentElement.requestFullscreen
  );
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onChange = () => setActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* user denied or unsupported */
    }
  }, []);

  return { supported, active, toggle };
}
