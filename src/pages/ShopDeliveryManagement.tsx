import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { deliveryPersonnel } from "@/data/deliveryData";
import { orders } from "@/data/mockData";
import { Truck, Package, Clock, AlertTriangle, Phone, UserCheck, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AssignmentStatus = "Assigned" | "On the way" | "Delivered" | "Delayed";

interface DeliveryAssignment {
  id: string;
  orderId: string;
  product: string;
  quantity: string;
  agentId: string;
  agentName: string;
  phone: string;
  vehicleNumber: string;
  status: AssignmentStatus;
  assignedTime: string;
}

const initialAssignments: DeliveryAssignment[] = [
  { id: "DA-001", orderId: "ORD-1001", product: "Rice", quantity: "200 kg", agentId: "dp1", agentName: "Ramesh Kumar", phone: "9876543210", vehicleNumber: "TN10AB1234", status: "Delivered", assignedTime: "2026-03-09 05:30" },
  { id: "DA-002", orderId: "ORD-1002", product: "Sugar", quantity: "50 kg", agentId: "dp2", agentName: "Suresh Babu", phone: "9876543222", vehicleNumber: "TN09CD5678", status: "On the way", assignedTime: "2026-03-09 08:45" },
  { id: "DA-003", orderId: "ORD-1005", product: "Wheat", quantity: "300 kg", agentId: "dp1", agentName: "Ramesh Kumar", phone: "9876543210", vehicleNumber: "TN10AB1234", status: "Assigned", assignedTime: "2026-03-10 07:00" },
];

const ShopDeliveryManagement = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const shopName = user?.shop || "Anna Nagar FPS";
  const district = user?.district || "Chennai";

  const [assignments, setAssignments] = useState<DeliveryAssignment[]>(initialAssignments);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [expectedTime, setExpectedTime] = useState("");

  const shopOrders = orders.filter(o => o.shop === shopName);
  const districtAgents = deliveryPersonnel.filter(a => a.assignedDistrict === district && a.status === "Active");
  const selectedAgentData = districtAgents.find(a => a.id === selectedAgent);
  const selectedOrderData = shopOrders.find(o => o.id === selectedOrder);

  const completed = assignments.filter(a => a.status === "Delivered").length;
  const pending = assignments.filter(a => a.status === "Assigned" || a.status === "On the way").length;
  const delayed = assignments.filter(a => a.status === "Delayed").length;

  const cards = [
    { label: t("delivery_mgmt.total_assignments"), value: assignments.length, icon: Truck, color: "text-primary" },
    { label: t("delivery_mgmt.pending_assignments"), value: pending, icon: Clock, color: "text-warning" },
    { label: t("delivery_mgmt.completed_assignments"), value: completed, icon: Package, color: "text-success" },
    { label: t("delivery_mgmt.delayed_assignments"), value: delayed, icon: AlertTriangle, color: "text-destructive" },
  ];

  const handleAssign = () => {
    if (!selectedOrder || !selectedAgent || !expectedTime || !selectedAgentData || !selectedOrderData) return;
    const newAssignment: DeliveryAssignment = {
      id: `DA-${String(assignments.length + 1).padStart(3, "0")}`,
      orderId: selectedOrderData.id,
      product: selectedOrderData.items,
      quantity: `${selectedOrderData.qty} ${selectedOrderData.unit}`,
      agentId: selectedAgentData.id,
      agentName: selectedAgentData.name,
      phone: selectedAgentData.phone,
      vehicleNumber: selectedAgentData.vehicleNumber,
      status: "Assigned",
      assignedTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setAssignments(prev => [newAssignment, ...prev]);
    setSelectedOrder("");
    setSelectedAgent("");
    setExpectedTime("");
  };

  const statusClass = (status: AssignmentStatus) => {
    switch (status) {
      case "Delivered": return "bg-success/20 text-success";
      case "On the way": return "bg-warning/20 text-warning";
      case "Delayed": return "bg-destructive/20 text-destructive";
      case "Assigned": return "bg-info/20 text-info";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("delivery_mgmt.title")} — {shopName}</h2>
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

      {/* Assignment Form */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="command-panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t("delivery_mgmt.assign")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("delivery_mgmt.select_order")}</label>
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger><SelectValue placeholder={t("delivery_mgmt.select_order")} /></SelectTrigger>
              <SelectContent>
                {shopOrders.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.id} — {o.items} ({o.qty} {o.unit})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("delivery_mgmt.select_agent")}</label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger><SelectValue placeholder={t("delivery_mgmt.select_agent")} /></SelectTrigger>
              <SelectContent>
                {districtAgents.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name} — {a.vehicleNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("delivery_mgmt.vehicle_number")}</label>
            <Input value={selectedAgentData?.vehicleNumber || ""} readOnly className="bg-muted" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("delivery_mgmt.expected_time")}</label>
            <Input type="datetime-local" value={expectedTime} onChange={e => setExpectedTime(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleAssign} disabled={!selectedOrder || !selectedAgent || !expectedTime} className="mt-4">
          <Truck className="w-4 h-4 mr-2" />
          {t("delivery_mgmt.assign_button")}
        </Button>
      </motion.div>

      {/* Assignments Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="command-panel">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t("delivery_mgmt.assignments")}</h3>
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
                <th>{t("delivery.status")}</th>
                <th>{t("delivery_mgmt.assigned_time")}</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? assignments.map(a => (
                <tr key={a.id}>
                  <td className="font-mono text-xs">{a.orderId}</td>
                  <td>{a.product}</td>
                  <td>{a.quantity}</td>
                  <td className="font-medium">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-primary" />
                      {a.agentName}
                    </span>
                  </td>
                  <td>
                    <a href={`tel:${a.phone}`} className="flex items-center gap-1 text-primary hover:underline" title={t("delivery_mgmt.contact_driver")}>
                      <Phone className="w-3 h-3" />
                      {a.phone}
                    </a>
                  </td>
                  <td>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-muted-foreground" />
                      {a.vehicleNumber}
                    </span>
                  </td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass(a.status)}`}>
                      {a.status === "Assigned" ? t("delivery_mgmt.assigned") : a.status === "On the way" ? t("delivery.on_the_way") : a.status === "Delivered" ? t("delivery.delivered") : t("delivery.delayed_status")}
                    </span>
                  </td>
                  <td className="text-xs text-muted-foreground">{a.assignedTime}</td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="text-center text-muted-foreground py-4">{t("common.no_data")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Delivery Timeline */}
      {assignments.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("delivery.timeline")}</h3>
          <div className="space-y-3">
            {assignments.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div className={`w-3 h-3 mt-1 rounded-full shrink-0 ${a.status === "Delivered" ? "bg-success" : a.status === "On the way" ? "bg-warning animate-pulse" : a.status === "Delayed" ? "bg-destructive animate-pulse" : "bg-info"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{a.orderId}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{a.product} ({a.quantity})</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.agentName} · {a.vehicleNumber} · {a.assignedTime}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusClass(a.status)}`}>
                  {a.status === "Assigned" ? t("delivery_mgmt.assigned") : a.status === "On the way" ? t("delivery.on_the_way") : a.status === "Delivered" ? t("delivery.delivered") : t("delivery.delayed_status")}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ShopDeliveryManagement;
