import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { activityLogs } from "@/data/mockData";

const actionColor: Record<string, string> = {
  Login: "text-info",
  "Order Approved": "text-success",
  "Stock Update": "text-warning",
  "Admin Created": "text-primary",
  "Fraud Flagged": "text-destructive",
  "Login Failed": "text-destructive",
};

const LogsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("logs.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("logs.subtitle")}</p>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="command-panel">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>{t("logs.timestamp")}</th><th>{t("logs.action")}</th><th>{t("logs.user")}</th><th>{t("logs.details")}</th></tr></thead>
            <tbody>
              {activityLogs.map(log => (
                <tr key={log.id}>
                  <td className="font-mono text-xs text-muted-foreground">{log.timestamp}</td>
                  <td><span className={`font-medium text-xs ${actionColor[log.action] || "text-foreground"}`}>{log.action}</span></td>
                  <td className="text-xs">{log.user}</td>
                  <td className="text-xs text-muted-foreground">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default LogsPage;
