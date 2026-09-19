import { useEffect } from "react";
import { useSensorStore } from "@/stores/sensorStore";
import type { SensorSnapshot } from "@/types/sensors";

/**
 * Subscribes to hardware sensor snapshots pushed from the Electron main
 * process. In a plain browser `window.nexus` is undefined, so this is a no-op
 * and the sensor panels render their "desktop only" state.
 */
export function useSensors() {
  const setLatest = useSensorStore((s) => s.setLatest);
  const setSupported = useSensorStore((s) => s.setSupported);

  useEffect(() => {
    const bridge = window.nexus;
    if (!bridge?.onSensors) {
      setSupported(false);
      return;
    }
    setSupported(true);

    bridge.getSensors?.().then((s) => s && setLatest(s as SensorSnapshot)).catch(() => {});
    const unsubscribe = bridge.onSensors((data) => setLatest(data as SensorSnapshot));
    return unsubscribe;
  }, [setLatest, setSupported]);
}
