import { motion, AnimatePresence } from "framer-motion";
import { PanelFrame } from "@/components/common/PanelFrame";
import { useAlertStore } from "@/stores/alertStore";
import type { AlertSeverity } from "@/types/telemetry";

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  info: "#2f6bff",
  warning: "#f0a92e",
  critical: "#e5142a",
};

export function AlertPanel() {
  const alerts = useAlertStore((s) => s.active);
  const hasAlerts = alerts.length > 0;

  return (
    <PanelFrame
      title="Spider-Sense"
      storageKey="alerts"
      alert={hasAlerts}
      right={
        <span
          className="font-mono text-[9px] tracking-widest2"
          style={{ color: hasAlerts ? "#e5142a" : "#47526f" }}
        >
          {hasAlerts ? `${alerts.length} ACTIVE` : "QUIET"}
        </span>
      }
    >
      <AnimatePresence initial={false}>
        {!hasAlerts ? (
          <motion.p
            key="clear"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[11px] text-web-mute"
          >
            Nothing's tingling. All systems steady.
          </motion.p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => {
              const color = SEVERITY_COLOR[a.severity];
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-l-2 pl-2"
                  style={{ borderColor: color }}
                >
                  <div className="font-display text-[11px] uppercase tracking-wider" style={{ color }}>
                    {a.title}
                  </div>
                  <div className="font-mono text-[10px] text-web-faint">{a.description}</div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </PanelFrame>
  );
}
