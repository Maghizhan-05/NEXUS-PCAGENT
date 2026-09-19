import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCardState } from "@/hooks/useCardState";

interface Props {
  title: string;
  /** Stable key enables a persisted collapse toggle for this plate. */
  storageKey?: string;
  alert?: boolean;
  right?: ReactNode;
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
}

/**
 * A "suit plate": titled panel with an optional collapse toggle whose state is
 * remembered per viewer, and a spider-sense red rail when `alert` is set.
 */
export function PanelFrame({
  title,
  storageKey,
  alert = false,
  right,
  bodyClassName = "",
  className = "",
  children,
}: Props) {
  const { collapsed, toggle } = useCardState(storageKey ?? title, false);
  const collapsible = Boolean(storageKey);
  const isCollapsed = collapsible && collapsed;

  return (
    <div className={`panel ${alert ? "is-alert" : ""} ${className}`}>
      <div className="panel-head">
        <span className={`panel-title ${alert ? "text-web-red" : ""}`}>{title}</span>
        <div className="flex items-center gap-2.5">
          {right}
          {collapsible && (
            <button
              onClick={toggle}
              aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
              aria-expanded={!isCollapsed}
              className="text-web-faint transition-colors hover:text-web-blue"
            >
              <ChevronDown
                size={13}
                className="transition-transform duration-200"
                style={{ transform: isCollapsed ? "rotate(-90deg)" : "none" }}
              />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`px-3 py-2.5 ${bodyClassName}`}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
