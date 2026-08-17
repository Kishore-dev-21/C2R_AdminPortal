import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { alerts } from "@/data/mockData";

const iconMap = {
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  success: CheckCircle,
};

const colorMap = {
  warning: "text-warning border-l-warning",
  danger: "text-destructive border-l-destructive",
  info: "text-info border-l-info",
  success: "text-success border-l-success",
};

const AlertPanel = () => {
  return (
    <aside className="w-72 min-h-screen bg-card border-l border-border flex flex-col shrink-0 hidden xl:flex">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live Alerts</p>
        <span className="w-5 h-5 rounded-full bg-destructive/20 text-destructive text-[10px] font-bold flex items-center justify-center">
          {alerts.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        <AnimatePresence>
          {alerts.map((alert, i) => {
            const Icon = iconMap[alert.type];
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-md bg-muted/30 border-l-2 ${colorMap[alert.type]}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default AlertPanel;
