import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { AdminInvestigationAction } from "@/services/fraudEngine/types";
import { FraudAuditService } from "@/services/fraudEngine/auditLogService";
import { useAuth } from "@/contexts/AuthContext";

interface InvestigationAuditTableProps {
  districtFilter?: string;
}

const actionStyles: Record<string, { bg: string; text: string; label: string }> = {
  HOLD_DELIVERY: { bg: "bg-destructive/15", text: "text-destructive", label: "HOLD DELIVERY" },
  REQUEST_VERIFICATION: { bg: "bg-info/15", text: "text-info", label: "REQUEST EXTRA OTP" },
  APPROVE_DELIVERY: { bg: "bg-success/15", text: "text-success", label: "APPROVED DISPATCH" },
  REJECT_DELIVERY: { bg: "bg-destructive/20", text: "text-destructive", label: "REJECTED" },
  MARK_INVESTIGATED: { bg: "bg-purple-500/15", text: "text-purple-600 dark:text-purple-400", label: "INVESTIGATED" },
  ESCALATE: { bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", label: "ESCALATED" },
};

export const InvestigationAuditTable: React.FC<InvestigationAuditTableProps> = ({
  districtFilter,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const auditLogs = FraudAuditService.getAuditLogs({
    district: districtFilter,
    role: user?.role,
    shop: user?.shop,
  });

  const filteredLogs = auditLogs.filter((log) => {
    if (searchQuery) {
      return (
        log.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.beneficiaryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Search Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-muted/40 rounded-lg border border-border">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search audit actions, transaction IDs, admin signatures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-72"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Immutable Records: <span className="font-semibold text-foreground">{filteredLogs.length}</span> committed actions
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="command-panel overflow-hidden border border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Timestamp</th>
                <th>Transaction</th>
                <th>Beneficiary</th>
                <th>Administrator</th>
                <th>Action Taken</th>
                <th>Resulting Decision</th>
                <th>Investigation Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const styling = actionStyles[log.action] || { bg: "bg-muted", text: "text-muted-foreground", label: log.action };
                return (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="font-mono text-xs font-semibold text-foreground">
                      {log.id}
                    </td>
                    <td className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="font-mono text-xs text-foreground font-medium">
                      {log.transactionId}
                    </td>
                    <td className="font-mono text-xs text-muted-foreground">
                      {log.beneficiaryId}
                    </td>
                    <td className="text-xs">
                      <div>
                        <span className="font-semibold text-foreground">{log.adminName}</span>
                        <span className="text-[10px] text-muted-foreground block">{log.adminRole}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styling.bg} ${styling.text}`}>
                        {styling.label}
                      </span>
                    </td>
                    <td className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {log.resultingDecision.replace("_", " ")}
                    </td>
                    <td className="text-xs text-muted-foreground max-w-xs truncate" title={log.notes}>
                      {log.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
