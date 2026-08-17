import {
  LayoutDashboard, MapPin, Warehouse, Store, ShoppingCart, Package,
  AlertTriangle, BarChart3, Users, FileText, Settings
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "District Monitoring", url: "/districts", icon: MapPin },
  { title: "Warehouse Monitoring", url: "/warehouses", icon: Warehouse },
  { title: "Shop Monitoring", url: "/shops", icon: Store },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Fraud Detection", url: "/fraud", icon: AlertTriangle },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Admin Management", url: "/admin", icon: Users },
  { title: "Activity Logs", url: "/logs", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

const AppSidebar = () => {
  return (
    <aside className="w-56 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-sidebar-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Navigation</p>
      </div>
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-primary font-medium"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="text-[10px] text-muted-foreground text-center">
          v2.1.0 · © 2026 Govt. of India
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
