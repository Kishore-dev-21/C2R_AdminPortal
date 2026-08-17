import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { deliveries } from "@/data/deliveryData";
import { Truck, Package, Clock, AlertTriangle, Phone, CheckCircle2 } from "lucide-react";

const ShopDeliveryDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const shopName = user?.shop || "Anna Nagar FPS";

  const shopDeliveries = deliveries.filter(d => d.shopName === shopName);
  const completed = shopDeliveries.filter(d => d.deliveryStatus === "Delivered").length;
  const pending = shopDeliveries.filter(d => d.deliveryStatus === "On the way").length;
  const delayed = shopDeliveries.filter(d => d.deliveryStatus === "Delayed").length;

  const cards = [
    { label: t("delivery.total_today"), value: shopDeliveries.length, icon: Truck, color: "text-primary" },
    { label: t("delivery.pending"), value: pending, icon: Clock, color: "text-warning" },
    { label: t("delivery.completed"), value: completed, icon: Package, color: "text-success" },
    { label: t("delivery.delayed"), value: delayed, icon: AlertTriangle, color: "text-destructive" },
  ];

  const statusClass = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-success/20 text-success";
      case "On the way": return "bg-warning/20 text-warning";
      case "Delayed": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "Delivered": return t("delivery.delivered");
      case "On the way": return t("delivery.on_the_way");
      case "Delayed": return t("delivery.delayed_status");
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("delivery.title")} — {shopName}</h2>
        <p className="text-xs text-muted-foreground">{t("role.shop")} · {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="metric-card">
            <c.icon className={`w-5 h-5 mb-2 ${c.color}`} />
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Delivery Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="command-panel">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t("delivery.title")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("delivery.order_id")}</th>
                <th>{t("delivery.product")}</th>
                <th>{t("delivery.quantity")}</th>
                <th>{t("delivery.person")}</th>
                <th>{t("delivery.phone")}</th>
                <th>{t("delivery.vehicle")}</th>
                <th>{t("delivery.warehouse")}</th>
                <th>{t("delivery.status")}</th>
                <th>{t("delivery.dispatch_time")}</th>
                <th>{t("delivery.delivery_time")}</th>
                <th>{t("delivery.signature_verified")}</th>
              </tr>
            </thead>
            <tbody>
              {shopDeliveries.length > 0 ? shopDeliveries.map(d => (
                <tr key={d.id}>
                  <td className="font-mono text-xs">{d.orderId}</td>
                  <td>{d.product}</td>
                  <td>{d.quantity}</td>
                  <td className="font-medium">{d.deliveryPersonName}</td>
                  <td>
                    <a href={`tel:${d.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Phone className="w-3 h-3" />
                      {d.phone}
                    </a>
                  </td>
                  <td>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-muted-foreground" />
                      {d.vehicleNumber}
                    </span>
                  </td>
                  <td className="text-xs">{d.dispatchWarehouse}</td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass(d.deliveryStatus)}`}>
                      {statusLabel(d.deliveryStatus)}
                    </span>
                  </td>
                  <td className="text-xs text-muted-foreground">{d.dispatchTime}</td>
                  <td className="text-xs text-muted-foreground">{d.deliveryTime || "—"}</td>
                  <td>
                    {d.signatureVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={11} className="text-center text-muted-foreground py-4">No deliveries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Delivery Timeline */}
      {shopDeliveries.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Delivery Timeline</h3>
          <div className="space-y-3">
            {shopDeliveries.map((d) => (
              <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div className={`w-3 h-3 mt-1 rounded-full shrink-0 ${d.deliveryStatus === "Delivered" ? "bg-success" : d.deliveryStatus === "On the way" ? "bg-warning animate-pulse" : "bg-destructive animate-pulse"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{d.orderId}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{d.product} ({d.quantity})</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{d.dispatchTime}</span>
                    <span>→</span>
                    <span>{d.deliveryTime ? `${d.deliveryTime}` : `${statusLabel(d.deliveryStatus)}`}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.deliveryPersonName} · {d.vehicleNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ShopDeliveryDashboard;
