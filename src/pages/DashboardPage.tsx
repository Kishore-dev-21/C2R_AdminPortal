import { motion } from "framer-motion";
import MetricCard from "@/components/dashboard/MetricCard";
import { nationalMetrics, products, stockByDistrict, stockTrend, districts, shops, fraudCases } from "@/data/mockData";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend
} from "recharts";

const COLORS = ["hsl(142 60% 45%)", "hsl(210 100% 52%)", "hsl(38 92% 50%)", "hsl(0 72% 51%)", "hsl(280 65% 60%)", "hsl(180 60% 45%)"];

const statusColor = { normal: "text-success", low: "text-warning", alert: "text-destructive" };
const statusDot = { normal: "status-dot-green", low: "status-dot-yellow", alert: "status-dot-red" };

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">National Overview</h2>
        <p className="text-xs text-muted-foreground">Real-time PDS monitoring · Last updated: {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {nationalMetrics.map((m, i) => (
          <MetricCard key={m.label} {...m} index={i} />
        ))}
      </div>

      {/* Charts Row 1: Stock Pie + District Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">National Stock Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={products} dataKey="nationalStock" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {products.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="command-panel p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">District Stock Levels (tons)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByDistrict}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
                <XAxis dataKey="district" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} />
                <Bar dataKey="Rice" fill={COLORS[0]} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Wheat" fill={COLORS[1]} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Sugar" fill={COLORS[2]} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Chart Row 2: Stock Trend */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="command-panel p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Stock Trend (6 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stockTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 16%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(215 25% 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210 40% 93%)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Rice" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Wheat" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Sugar" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Districts + Shops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="command-panel">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">District Status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>District</th><th>Shops</th><th>Stock (T)</th><th>Status</th></tr></thead>
              <tbody>
                {districts.map(d => (
                  <tr key={d.id}>
                    <td className="font-medium">{d.name}</td>
                    <td>{d.shops}</td>
                    <td>{d.stockTons.toLocaleString()}</td>
                    <td><span className={`flex items-center gap-1.5 text-xs ${statusColor[d.status]}`}><span className={statusDot[d.status]} />{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="command-panel">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Fraud Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Type</th><th>District</th><th>Severity</th><th>Progress</th></tr></thead>
              <tbody>
                {fraudCases.slice(0, 4).map(f => (
                  <tr key={f.id}>
                    <td className="font-medium text-xs">{f.type}</td>
                    <td>{f.district}</td>
                    <td><span className={`text-xs font-medium ${f.severity === "Critical" ? "text-destructive" : f.severity === "High" ? "text-warning" : "text-muted-foreground"}`}>{f.severity}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${f.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{f.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
