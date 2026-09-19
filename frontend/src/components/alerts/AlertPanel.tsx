import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useAlertStore } from "@/stores/alertStore";
import type { AlertSeverity } from "@/types/telemetry";

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  info: "#22d3ee",
  warning: "#f5b642",
  critical: "#f04a4a",
};

export function AlertPanel() {
  const alerts = useAlertStore((s) => s.active);

  return (
    <div className="panel corner-bracket p-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={13} className="text-nexus-cyan" strokeWidth={1.5} />
        <span className="panel-label">Alerts</span>
      </div>

      <div className="mt-2 space-y-2">
        <AnimatePresence initial={false}>
          {alerts.length === 0 ? (
            <motion.div
              key="clear"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[11px] text-nexus-mute"
            >
              <ShieldCheck size={13} className="text-nexus-cyan" />
              No active alerts. All systems nominal.
            </motion.div>
          ) : (
            alerts.map((a) => {
              const color = SEVERITY_COLOR[a.severity];
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-l-2 pl-2"
                  style={{ borderColor: color }}
                >
                  <div className="text-[11px] tracking-[0.15em]" style={{ color }}>
                    {a.title}
                  </div>
                  <div className="text-[10px] text-nexus-mute">{a.description}</div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
