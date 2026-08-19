import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Store,
  Package,
  User,
  Truck,
  ShieldAlert,
  FileSpreadsheet,
  PauseCircle,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { FraudChainEvent } from "@/services/fraudEngine/types";

interface FraudChainTimelineProps {
  events: FraudChainEvent[];
  onSelectEvent?: (event: FraudChainEvent) => void;
}

const entityIcons: Record<string, any> = {
  FPS: Store,
  INVENTORY: Package,
  BENEFICIARY: User,
  DELIVERY_AGENT: Truck,
  VERIFICATION: ShieldAlert,
  TRANSACTION: FileSpreadsheet,
};

const severityStyles: Record<string, { badge: string; dot: string }> = {
  LOW: { badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  MEDIUM: { badge: "bg-info/15 text-info border border-info/30", dot: "bg-info" },
  HIGH: { badge: "bg-warning/15 text-warning border border-warning/30", dot: "bg-warning" },
  CRITICAL: { badge: "bg-destructive/15 text-destructive border border-destructive/30", dot: "bg-destructive" },
};

export const FraudChainTimeline: React.FC<FraudChainTimelineProps> = ({
  events,
  onSelectEvent,
}) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const filteredEvents = events.filter((e) => {
    if (filterType === "ALL") return true;
    return e.entityType === filterType;
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-semibold text-foreground">Chronological Event Sequence</span>
          <span>({filteredEvents.length} events)</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {["ALL", "FPS", "INVENTORY", "BENEFICIARY", "DELIVERY_AGENT", "VERIFICATION", "TRANSACTION"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                  filterType === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {filteredEvents.map((evt, idx) => {
          const Icon = entityIcons[evt.entityType] || Clock;
          const sev = severityStyles[evt.severity] || severityStyles.LOW;
          const isSelected = selectedEventId === evt.id;

          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => {
                setSelectedEventId(evt.id);
                if (onSelectEvent) onSelectEvent(evt);
              }}
              className={`relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-card border-border hover:bg-muted/30"
              }`}
            >
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full border-2 border-background flex items-center justify-center ${sev.dot}`}
              />

              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-muted text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{evt.title}</h5>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {evt.timeLabel} · {evt.entityName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {evt.evidenceImpact > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-destructive/10 text-destructive font-mono">
                      +{evt.evidenceImpact} pts
                    </span>
                  )}
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${sev.badge}`}>
                    {evt.severity}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {evt.description}
              </p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
                <span>Source: {evt.sourceRecordId}</span>
                <span>Type: {evt.eventType}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
