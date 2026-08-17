import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops, warehouses, orders, fraudCases, stockByDistrict, monthlyOrderTrends, shopInventory } from "@/data/mockData";
import { Store, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend
} from "recharts";

const COLORS = ["hsl(142 60% 45%)", "hsl(210 100% 52%)", "hsl(38 92% 50%)"];

const DistrictAdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const district = user?.district || "Chennai";

  const districtShops = shops.filter(s => s.district === district);
  const districtWarehouses = warehouses.filter(w => w.district === district);
  const districtOrders = orders.filter(o => o.district === district);
  const districtFraud = fraudCases.filter(f => f.district === district);
  const districtStock = stockByDistrict.find(s => s.district === district);

  const productData = districtStock
    ? [
        { name: "Rice", value: districtStock.Rice },
        { name: "Wheat", value: districtStock.Wheat },
        { name: "Sugar", value: districtStock.Sugar },
        { name: "Kerosene", value: districtStock.Kerosene },
        { name: "Cooking Oil", value: districtStock.CookingOil },
        { name: "Salt", value: districtStock.Salt },
      ]
    : [];

  const orderTrendData = monthlyOrderTrends.map(m => ({
    month: m.month,
    orders: (m as any)[district] || 0,
  }));

  const cards = [
    { label: t("district.shops_in_district"), value: districtShops.length, icon: Store },
    { label: t("district.district_stock"), value: districtStock ? Object.values(districtStock).filter(v => typeof v === "number").reduce((a, b) => a + b, 0) : 0, icon: Package },
    { label: t("district.orders_today"), value: districtOrders.length, icon: ShoppingCart },
    { label: t("district.fraud_alerts"), value: districtFraud.length, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{district} {t("district.dashboard_title")}</h2>
        <p className="text-xs text-muted-foreground">{t("district.access_label")} · {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="metric-card">
            <c.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{typeof c.value === "number" ? c.value.toLocaleString() : c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("district.product_stock")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} />
                <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("district.monthly_trends")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} />
                <Line type="monotone" dataKey="orders" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="command-panel">
        <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">{t("district.shop_performance")}</h3></div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>{t("common.shop")}</th><th>{t("table.daily_orders")}</th><th>{t("table.monthly_dist")}</th><th>{t("table.inventory_health")}</th><th>{t("table.fraud_risk")}</th></tr></thead>
            <tbody>
              {districtShops.map(s => (
                <tr key={s.id}>
                  <td className="font-medium">{s.name}</td>
                  <td>{s.dailyOrders}</td>
                  <td>{s.monthlyDist.toLocaleString()}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${s.inventoryHealth > 70 ? "bg-success" : s.inventoryHealth > 40 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${s.inventoryHealth}%` }} /></div>
                      <span className="text-[10px] text-muted-foreground">{s.inventoryHealth}%</span>
                    </div>
                  </td>
                  <td><span className={`text-xs font-medium ${s.fraudRisk > 20 ? "text-destructive" : s.fraudRisk > 10 ? "text-warning" : "text-success"}`}>{s.fraudRisk}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="command-panel">
        <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">{t("district.recent_orders")}</h3></div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>{t("orders.order_id")}</th><th>{t("common.shop")}</th><th>{t("orders.items")}</th><th>{t("orders.qty")}</th><th>{t("common.status")}</th><th>{t("orders.timestamp")}</th></tr></thead>
            <tbody>
              {districtOrders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.id}</td>
                  <td>{o.shop}</td>
                  <td>{o.items}</td>
                  <td>{o.qty} {o.unit}</td>
                  <td><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status === "Delivered" ? "bg-success/20 text-success" : o.status === "Pending" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"}`}>{o.status}</span></td>
                  <td className="text-xs text-muted-foreground">{o.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {districtWarehouses.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="command-panel">
          <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">{t("district.warehouse")}</h3></div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>{t("common.name")}</th><th>{t("warehouses.capacity")}</th><th>{t("warehouses.current_stock")}</th><th>{t("warehouses.utilization")}</th><th>{t("warehouses.last_updated")}</th></tr></thead>
              <tbody>
                {districtWarehouses.map(w => (
                  <tr key={w.id}>
                    <td className="font-medium">{w.name}</td>
                    <td>{w.capacity.toLocaleString()} T</td>
                    <td>{w.currentStock.toLocaleString()} T</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${w.utilization}%` }} /></div>
                        <span className="text-[10px] text-muted-foreground">{w.utilization}%</span>
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground">{w.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DistrictAdminDashboard;
