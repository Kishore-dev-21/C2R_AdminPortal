import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops, orders, shopInventory } from "@/data/mockData";
import { ShoppingCart, Package, AlertTriangle, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const ShopAdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const shopName = user?.shop || "Anna Nagar FPS";

  const shop = shops.find(s => s.name === shopName);
  const shopOrders = orders.filter(o => o.shop === shopName);
  const inventory = shopInventory.filter(i => i.shopName === shopName);
  const lowStockItems = inventory.filter(i => i.stockQty <= i.minThreshold);

  const inventoryChartData = inventory.map(i => ({
    name: i.product,
    stock: i.stockQty,
    threshold: i.minThreshold,
  }));

  const cards = [
    { label: t("metric.todays_orders"), value: shopOrders.length, icon: ShoppingCart },
    { label: t("metric.products_in_stock"), value: inventory.length, icon: Package },
    { label: t("metric.low_stock_alerts"), value: lowStockItems.length, icon: AlertTriangle },
    { label: t("metric.monthly_distribution"), value: shop?.monthlyDist?.toLocaleString() || "0", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{shopName} — {t("shop.dashboard_title")}</h2>
        <p className="text-xs text-muted-foreground">{t("shop.access_label")} · {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="metric-card">
            <c.icon className={`w-5 h-5 mb-2 ${c.label === t("metric.low_stock_alerts") && lowStockItems.length > 0 ? "text-destructive" : "text-primary"}`} />
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="command-panel p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t("shop.inventory_levels")}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} />
              <Bar dataKey="stock" fill="hsl(142 60% 45%)" radius={[4, 4, 0, 0]} name={t("common.stock")} />
              <Bar dataKey="threshold" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} name={t("table.min_threshold")} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="command-panel">
        <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">{t("shop.product_stock")}</h3></div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>{t("delivery.product")}</th><th>{t("common.stock")}</th><th>{t("common.unit")}</th><th>{t("table.min_threshold")}</th><th>{t("common.status")}</th></tr></thead>
            <tbody>
              {inventory.map((item, idx) => {
                const isLow = item.stockQty <= item.minThreshold;
                return (
                  <tr key={idx}>
                    <td className="font-medium">{item.product}</td>
                    <td>{item.stockQty.toLocaleString()}</td>
                    <td>{item.unit}</td>
                    <td>{item.minThreshold.toLocaleString()}</td>
                    <td>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isLow ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>
                        {isLow ? t("common.low_stock") : t("common.normal")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="command-panel">
        <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">{t("shop.recent_orders")}</h3></div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>{t("orders.order_id")}</th><th>{t("orders.items")}</th><th>{t("orders.qty")}</th><th>{t("common.status")}</th><th>{t("orders.timestamp")}</th></tr></thead>
            <tbody>
              {shopOrders.length > 0 ? shopOrders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.id}</td>
                  <td>{o.items}</td>
                  <td>{o.qty} {o.unit}</td>
                  <td><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status === "Delivered" ? "bg-success/20 text-success" : o.status === "Pending" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"}`}>{o.status}</span></td>
                  <td className="text-xs text-muted-foreground">{o.timestamp}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center text-muted-foreground py-4">{t("common.no_data")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {lowStockItems.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="command-panel border-destructive/30">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-semibold text-destructive">{t("shop.low_stock_alerts")}</h3>
          </div>
          <div className="p-4 space-y-2">
            {lowStockItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.product}</p>
                  <p className="text-xs text-muted-foreground">Current: {item.stockQty} {item.unit} · Min: {item.minThreshold} {item.unit}</p>
                </div>
                <span className="text-xs font-medium text-destructive">{t("common.restock_needed")}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ShopAdminDashboard;
