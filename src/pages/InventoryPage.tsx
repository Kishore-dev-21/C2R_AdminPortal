import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { products, stockByDistrict, stockTrend } from "@/data/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const COLORS = ["hsl(142 60% 45%)", "hsl(210 100% 52%)", "hsl(38 92% 50%)", "hsl(0 72% 51%)", "hsl(280 65% 60%)", "hsl(180 60% 45%)"];

const InventoryPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("inventory.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("inventory.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {products.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="metric-card text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.name}</p>
            <p className="text-xl font-bold text-foreground mt-1">{p.nationalStock.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{p.unit}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("inventory.composition")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={products} dataKey="nationalStock" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name} labelLine={false} fontSize={10}>{products.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("inventory.trend")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockTrend}><CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} /><YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} /><Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="Rice" stroke={COLORS[0]} strokeWidth={2} /><Line type="monotone" dataKey="Wheat" stroke={COLORS[1]} strokeWidth={2} /><Line type="monotone" dataKey="Sugar" stroke={COLORS[2]} strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
