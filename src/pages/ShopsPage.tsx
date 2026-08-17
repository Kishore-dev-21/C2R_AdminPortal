import { motion } from "framer-motion";
import { shops } from "@/data/mockData";

const badgeColor = (score: number) => score >= 80 ? "bg-success/20 text-success" : score >= 50 ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive";
const riskColor = (risk: number) => risk <= 10 ? "text-success" : risk <= 25 ? "text-warning" : "text-destructive";

const ShopsPage = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-bold text-foreground">Shop Monitoring</h2>
      <p className="text-xs text-muted-foreground">Fair Price Shop performance metrics</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {shops.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="metric-card">
          <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
          <p className="text-[10px] text-muted-foreground mb-3">{s.district}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><p className="text-muted-foreground">Daily Orders</p><p className="font-semibold text-foreground">{s.dailyOrders}</p></div>
            <div><p className="text-muted-foreground">Monthly Dist.</p><p className="font-semibold text-foreground">{s.monthlyDist.toLocaleString()}</p></div>
            <div><p className="text-muted-foreground">Health</p><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${badgeColor(s.inventoryHealth)}`}>{s.inventoryHealth}%</span></div>
            <div><p className="text-muted-foreground">Fraud Risk</p><p className={`font-semibold ${riskColor(s.fraudRisk)}`}>{s.fraudRisk}%</p></div>
          </div>
        </motion.div>
      ))}
    </div>
    <div className="command-panel">
      <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Performance Table</h3></div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Shop</th><th>District</th><th>Daily Orders</th><th>Monthly Dist.</th><th>Inventory Health</th><th>Fraud Risk</th></tr></thead>
          <tbody>
            {shops.map(s => (
              <tr key={s.id}>
                <td className="font-medium">{s.name}</td>
                <td>{s.district}</td>
                <td>{s.dailyOrders}</td>
                <td>{s.monthlyDist.toLocaleString()}</td>
                <td><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${badgeColor(s.inventoryHealth)}`}>{s.inventoryHealth}%</span></td>
                <td><span className={`font-medium ${riskColor(s.fraudRisk)}`}>{s.fraudRisk}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default ShopsPage;
