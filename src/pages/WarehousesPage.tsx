import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { warehouses } from "@/data/mockData";

const WarehousesPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("warehouses.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("warehouses.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {warehouses.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="metric-card">
            <h3 className="text-sm font-semibold text-foreground mb-1">{w.name}</h3>
            <p className="text-[10px] text-muted-foreground mb-4">{w.district} · {t("warehouses.last_updated")} {w.lastUpdated}</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{t("warehouses.utilization")}</span>
                  <span className={`font-semibold ${w.utilization > 80 ? "text-destructive" : w.utilization > 60 ? "text-warning" : "text-success"}`}>{w.utilization}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${w.utilization}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={`h-full rounded-full ${w.utilization > 80 ? "bg-destructive" : w.utilization > 60 ? "bg-warning" : "bg-success"}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">{t("warehouses.capacity")}</p><p className="font-semibold text-foreground">{w.capacity.toLocaleString()} T</p></div>
                <div><p className="text-muted-foreground">{t("warehouses.current_stock")}</p><p className="font-semibold text-foreground">{w.currentStock.toLocaleString()} T</p></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="command-panel">
        <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">{t("warehouses.details")}</h3></div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>{t("common.name")}</th><th>{t("common.district")}</th><th>{t("warehouses.capacity")}</th><th>{t("warehouses.current_stock")}</th><th>{t("warehouses.utilization")}</th><th>{t("warehouses.last_updated")}</th></tr></thead>
            <tbody>
              {warehouses.map(w => (
                <tr key={w.id}>
                  <td className="font-medium">{w.name}</td>
                  <td>{w.district}</td>
                  <td>{w.capacity.toLocaleString()} T</td>
                  <td>{w.currentStock.toLocaleString()} T</td>
                  <td><span className={`font-medium ${w.utilization > 80 ? "text-destructive" : w.utilization > 60 ? "text-warning" : "text-success"}`}>{w.utilization}%</span></td>
                  <td className="text-muted-foreground text-xs">{w.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarehousesPage;
