import {
  LayoutDashboard, MapPin, Warehouse, Store, ShoppingCart, Package,
  AlertTriangle, BarChart3, Users, FileText, Settings, LogOut, Truck, ClipboardList, Shield, Blocks, Workflow
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface NavItem {
  title: string;
  url: string;
  icon: any;
}

const superAdminNav: NavItem[] = [
  { title: "nav.dashboard", url: "/super-admin-dashboard", icon: LayoutDashboard },
  { title: "nav.district_monitoring", url: "/districts", icon: MapPin },
  { title: "nav.warehouse_monitoring", url: "/warehouses", icon: Warehouse },
  { title: "nav.shop_monitoring", url: "/shops", icon: Store },
  { title: "nav.orders", url: "/orders", icon: ShoppingCart },
  { title: "nav.inventory", url: "/inventory", icon: Package },
  { title: "nav.fraud_detection", url: "/fraud", icon: AlertTriangle },
  { title: "nav.fraud_chains", url: "/fraud-chains", icon: Workflow },
  { title: "nav.blockchain_audit", url: "/blockchain-audit", icon: Shield },
  { title: "nav.blockchain_explorer", url: "/blockchain-explorer", icon: Blocks },
  { title: "nav.analytics", url: "/analytics", icon: BarChart3 },
  { title: "nav.admin_management", url: "/admin", icon: Users },
  { title: "nav.activity_logs", url: "/logs", icon: FileText },
  { title: "nav.settings", url: "/settings", icon: Settings },
];

const districtAdminNav: NavItem[] = [
  { title: "nav.dashboard", url: "/district-admin-dashboard", icon: LayoutDashboard },
  { title: "nav.shop_monitoring", url: "/shops", icon: Store },
  { title: "nav.orders", url: "/orders", icon: ShoppingCart },
  { title: "nav.inventory", url: "/inventory", icon: Package },
  { title: "nav.fraud_detection", url: "/fraud", icon: AlertTriangle },
  { title: "nav.fraud_chains", url: "/fraud-chains", icon: Workflow },
  { title: "nav.blockchain_audit", url: "/blockchain-audit", icon: Shield },
  { title: "nav.blockchain_explorer", url: "/blockchain-explorer", icon: Blocks },
  { title: "nav.settings", url: "/settings", icon: Settings },
];

const shopAdminNav: NavItem[] = [
  { title: "nav.dashboard", url: "/shop-admin-dashboard", icon: LayoutDashboard },
  { title: "nav.orders", url: "/orders", icon: ShoppingCart },
  { title: "nav.inventory", url: "/inventory", icon: Package },
  { title: "nav.delivery_tracking", url: "/shop-delivery-dashboard", icon: Truck },
  { title: "nav.delivery_management", url: "/shop-delivery-management", icon: ClipboardList },
  { title: "nav.settings", url: "/settings", icon: Settings },
];

const navByRole: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: superAdminNav,
  DISTRICT_ADMIN: districtAdminNav,
  SHOP_ADMIN: shopAdminNav,
};

const RoleSidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const navItems = navByRole[user?.role || "SUPER_ADMIN"];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-56 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-sidebar-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t("nav.navigation")}</p>
      </div>
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-primary font-medium"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{t(item.title)}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-2 border-t border-sidebar-border">
        <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{t("nav.logout")}</span>
        </button>
        <div className="text-[10px] text-muted-foreground text-center mt-2">
          v2.1.0 · © 2026 Govt. of India
        </div>
      </div>
    </aside>
  );
};

export default RoleSidebar;
