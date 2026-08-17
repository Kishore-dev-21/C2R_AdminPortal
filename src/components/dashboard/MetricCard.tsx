import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  trend: number[];
  index: number;
}

const MetricCard = ({ label, value, change, trend, index }: MetricCardProps) => {
  const isPositive = change.startsWith("+");
  const isNegative = change.startsWith("-");
  const trendData = trend.map((v, i) => ({ v, i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="metric-card"
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {isPositive && <ArrowUp className="w-3 h-3 text-success" />}
            {isNegative && <ArrowDown className="w-3 h-3 text-destructive" />}
            <span className={`text-xs font-medium ${isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"}`}>
              {change}
            </span>
          </div>
        </div>
        <div className="w-20 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isNegative ? "hsl(0 72% 51%)" : "hsl(142 60% 45%)"} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={isNegative ? "hsl(0 72% 51%)" : "hsl(142 60% 45%)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={isNegative ? "hsl(0 72% 51%)" : "hsl(142 60% 45%)"}
                fill={`url(#grad-${index})`}
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
