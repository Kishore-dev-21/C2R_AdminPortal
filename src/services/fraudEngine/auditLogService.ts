import { AdminInvestigationAction } from "./types";

const AUDIT_STORAGE_KEY = "c2r_fraud_audit_actions";

// Default initial audit actions for demo and initial state
const defaultAuditActions: AdminInvestigationAction[] = [
  {
    id: "AUD-ACT-001",
    transactionId: "ORD-1003",
    beneficiaryId: "BEN-TN-MDU-00842",
    adminEmail: "madurai.admin@click2ration.gov",
    adminName: "Madurai District Admin",
    adminRole: "DISTRICT_ADMIN",
    action: "HOLD_DELIVERY",
    notes: "Delivery placed on hold due to 88/100 risk score and link to suspected cluster CLUSTER-MDU-01. Physical audit dispatched.",
    timestamp: "2026-03-09 11:05:22",
    previousRiskScore: 88,
    resultingDecision: "INVESTIGATION",
    district: "Madurai",
    shop: "Madurai Main FPS",
  },
  {
    id: "AUD-ACT-002",
    transactionId: "ORD-1004",
    beneficiaryId: "BEN-TN-SLM-00999",
    adminEmail: "superadmin@click2ration.gov",
    adminName: "Super Admin",
    adminRole: "SUPER_ADMIN",
    action: "REQUEST_VERIFICATION",
    notes: "New beneficiary with insufficient history requesting large quantity. Secondary physical biometric verification requested.",
    timestamp: "2026-03-09 11:32:10",
    previousRiskScore: 71,
    resultingDecision: "ADDITIONAL_VERIFICATION",
    district: "Salem",
    shop: "Salem Market FPS",
  },
  {
    id: "AUD-ACT-003",
    transactionId: "ORD-1002",
    beneficiaryId: "BEN-TN-CHE-00102",
    adminEmail: "kknagar.fps@click2ration.gov",
    adminName: "KK Nagar FPS Admin",
    adminRole: "SHOP_ADMIN",
    action: "APPROVE_DELIVERY",
    notes: "Verified beneficiary OTP in person. Slight quantity increase justified due to seasonal festival quota.",
    timestamp: "2026-03-09 10:12:45",
    previousRiskScore: 32,
    resultingDecision: "NORMAL",
    district: "Chennai",
    shop: "KK Nagar FPS",
  },
];

export class FraudAuditService {
  /**
   * Retrieves all audit actions, optionally filtered by user role/district/shop.
   */
  public static getAuditLogs(params?: {
    district?: string;
    shop?: string;
    role?: string;
  }): AdminInvestigationAction[] {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    let allLogs: AdminInvestigationAction[] = raw ? JSON.parse(raw) : defaultAuditActions;

    if (!raw) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(defaultAuditActions));
    }

    if (!params) return allLogs;

    // Filter by district if not Super Admin
    if (params.role === "DISTRICT_ADMIN" && params.district && params.district !== "All") {
      allLogs = allLogs.filter(log => log.district === params.district);
    } else if (params.role === "SHOP_ADMIN" && params.shop) {
      allLogs = allLogs.filter(log => log.shop === params.shop);
    }

    return allLogs;
  }

  /**
   * Appends an immutable audit log entry.
   */
  public static logAction(
    action: Omit<AdminInvestigationAction, "id" | "timestamp">
  ): AdminInvestigationAction {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const allLogs: AdminInvestigationAction[] = raw ? JSON.parse(raw) : defaultAuditActions;

    const newEntry: AdminInvestigationAction = {
      ...action,
      id: `AUD-ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    const updated = [newEntry, ...allLogs];
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  }
}
