import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { orders, OrderStatus } from "@/data/mockData";
import { Search } from "lucide-react";

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-warning/20 text-warning",
  Approved: "bg-info/20 text-info",
  Dispatched: "bg-primary/20 text-primary",
  Delivered: "bg-success/20 text-success",
};

const OrdersPage = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const filtered = orders.filter(o => (filter === "All" || o.status === filter) && (o.id.toLowerCase().includes(search.toLowerCase()) || o.district.toLowerCase().includes(search.toLowerCase()) || o.shop.toLowerCase().includes(search.toLowerCase())));

  const statusLabels: Record<string, string> = {
    All: t("common.all"),
    Pending: t("orders.pending"),
    Approved: t("orders.approved"),
    Dispatched: t("orders.dispatched"),
    Delivered: t("orders.delivered"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("orders.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("orders.subtitle")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("orders.search")} className="pl-9 pr-4 py-2 rounded-md bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-64" />
        </div>
        <div className="flex gap-1">
          {["All", "Pending", "Approved", "Dispatched", "Delivered"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{statusLabels[s]}</button>
          ))}
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="command-panel">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>{t("orders.order_id")}</th><th>{t("common.district")}</th><th>{t("common.shop")}</th><th>{t("orders.items")}</th><th>{t("orders.qty")}</th><th>{t("common.status")}</th><th>{t("orders.timestamp")}</th></tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-xs font-medium">{o.id}</td>
                  <td>{o.district}</td>
                  <td>{o.shop}</td>
                  <td className="text-xs">{o.items}</td>
                  <td>{o.qty}</td>
                  <td><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${statusStyles[o.status]}`}>{statusLabels[o.status]}</span></td>
                  <td className="text-muted-foreground text-xs">{o.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default OrdersPage;
