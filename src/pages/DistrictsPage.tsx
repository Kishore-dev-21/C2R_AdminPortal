import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { districts, stockByDistrict } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const statusColor = { normal: "text-success", low: "text-warning", alert: "text-destructive" };
const statusDot = { normal: "status-dot-green", low: "status-dot-yellow", alert: "status-dot-red" };

const DistrictsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("districts.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("districts.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {districts.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{d.name}</h3>
              <span className={`flex items-center gap-1 text-[10px] font-medium ${statusColor[d.status]}`}><span className={statusDot[d.status]} />{d.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-muted-foreground">{t("districts.shops")}</p><p className="font-semibold text-foreground">{d.shops}</p></div>
              <div><p className="text-muted-foreground">{t("districts.warehouses")}</p><p className="font-semibold text-foreground">{d.warehouses}</p></div>
              <div><p className="text-muted-foreground">{t("districts.ration_cards")}</p><p className="font-semibold text-foreground">{d.rationCards.toLocaleString()}</p></div>
              <div><p className="text-muted-foreground">{t("common.stock")} (T)</p><p className="font-semibold text-foreground">{d.stockTons.toLocaleString()}</p></div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t("districts.stock_comparison")}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockByDistrict}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} />
              <Bar dataKey="Rice" fill="hsl(142 60% 45%)" radius={[2,2,0,0]} />
              <Bar dataKey="Wheat" fill="hsl(210 100% 52%)" radius={[2,2,0,0]} />
              <Bar dataKey="Sugar" fill="hsl(38 92% 50%)" radius={[2,2,0,0]} />
              <Bar dataKey="Kerosene" fill="hsl(0 72% 51%)" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DistrictsPage;
