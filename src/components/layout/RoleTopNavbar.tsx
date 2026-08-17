import { Bell, ChevronDown, Shield, Sun, Moon, Languages } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const RoleTopNavbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const roleLabels = {
    SUPER_ADMIN: t("role.national"),
    DISTRICT_ADMIN: t("role.district"),
    SHOP_ADMIN: t("role.shop"),
  };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "??";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-foreground">{t("system.title")}</h1>
            <p className="text-[10px] text-muted-foreground leading-none">{t("system.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
          <span className="status-dot-green animate-pulse-glow" />
          <span className="text-xs font-medium text-primary">{t("system.online")}</span>
        </div>

        <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent transition-colors border border-border" title={language === "en" ? "தமிழில் மாற்று" : "Switch to English"}>
          <Languages className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{language === "en" ? "தமிழ்" : "EN"}</span>
        </button>

        <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-accent transition-colors">
          {theme === "dark" ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-foreground" />}
        </button>

        <motion.button whileTap={{ scale: 0.95 }} className="relative p-2 rounded-md hover:bg-accent transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold flex items-center justify-center text-destructive-foreground">7</span>
        </motion.button>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{initials}</div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-foreground">{user?.name || "Admin"}</p>
            <p className="text-[10px] text-muted-foreground">{roleLabels[user?.role || "SUPER_ADMIN"]}</p>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default RoleTopNavbar;
