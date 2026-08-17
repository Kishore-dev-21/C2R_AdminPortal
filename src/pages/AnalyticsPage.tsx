import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { stockTrend, stockByDistrict, shops } from "@/data/mockData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const shopRadar = shops.map(s => ({ name: s.name.replace(" FPS", ""), orders: s.dailyOrders, health: s.inventoryHealth, risk: 100 - s.fraudRisk }));

const AnalyticsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("analytics.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("analytics.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("analytics.monthly_stock")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockTrend}><CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} /><YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} /><Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="Rice" stroke="hsl(142 60% 45%)" strokeWidth={2} /><Line type="monotone" dataKey="Wheat" stroke="hsl(210 100% 52%)" strokeWidth={2} /><Line type="monotone" dataKey="Sugar" stroke="hsl(38 92% 50%)" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("analytics.district_comparison")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByDistrict}><CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" /><XAxis dataKey="district" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} /><YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} /><Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} /><Bar dataKey="Rice" fill="hsl(142 60% 45%)" /><Bar dataKey="Wheat" fill="hsl(210 100% 52%)" /></BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="command-panel p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("analytics.shop_radar")}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={shopRadar}><PolarGrid stroke="hsl(215 25% 16%)" /><PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} /><Radar name="Orders" dataKey="orders" stroke="hsl(142 60% 45%)" fill="hsl(142 60% 45%)" fillOpacity={0.2} /><Radar name="Health" dataKey="health" stroke="hsl(210 100% 52%)" fill="hsl(210 100% 52%)" fillOpacity={0.2} /><Legend wrapperStyle={{ fontSize: 11 }} /><Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} /></RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
