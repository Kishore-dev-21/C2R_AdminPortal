import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Sun, Moon, Lock, Mail, Wheat, Truck, Users, Languages } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const roleRedirects: Record<UserRole, string> = {
  SUPER_ADMIN: "/super-admin-dashboard",
  DISTRICT_ADMIN: "/district-admin-dashboard",
  SHOP_ADMIN: "/shop-admin-dashboard",
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !role) {
      setError(t("login.fill_all"));
      return;
    }
    const result = login(email, password, role as UserRole);
    if (result.success) {
      navigate(roleRedirects[role as UserRole]);
    } else {
      setError(result.error || t("login.failed"));
    }
  };

  const fillDemo = (e: string, p: string, r: UserRole) => {
    setEmail(e);
    setPassword(p);
    setRole(r);
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-background transition-colors duration-500">
      {/* Top right controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card border border-border hover:bg-accent transition-colors"
          title={language === "en" ? "தமிழில் மாற்று" : "Switch to English"}
        >
          <Languages className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{language === "en" ? "தமிழ்" : "EN"}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-card border border-border hover:bg-accent transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-foreground" />}
        </button>
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center flex-1 p-12 bg-card border-r border-border">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("login.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-3">{t("login.platform_title")}</h2>
          <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">{t("login.platform_desc")}</p>

          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[
              { icon: Wheat, label: t("login.food_dist"), desc: t("login.food_dist_desc") },
              { icon: Truck, label: t("login.supply_chain"), desc: t("login.supply_chain_desc") },
              { icon: Users, label: t("login.beneficiaries"), desc: t("login.beneficiaries_desc") },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-4 rounded-lg bg-background border border-border text-center"
              >
                <f.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - Login card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">{t("login.title")}</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-foreground mb-1">{t("login.welcome")}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t("login.sign_in_desc")}</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("login.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("login.email_placeholder")}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("login.password")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("login.password_placeholder")}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("login.select_role")}</label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("login.choose_role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">{t("login.super_admin")}</SelectItem>
                    <SelectItem value="DISTRICT_ADMIN">{t("login.district_admin")}</SelectItem>
                    <SelectItem value="SHOP_ADMIN">{t("login.shop_admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-medium">
                  {error}
                </motion.p>
              )}

              <Button type="submit" className="w-full h-11 font-semibold">
                {t("login.button")}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-3">{t("login.demo_credentials")}</p>
              <div className="space-y-2">
                {[
                  { label: t("login.super_admin"), email: "superadmin@click2ration.gov", pass: "Admin@123", role: "SUPER_ADMIN" as UserRole },
                  { label: t("login.district_admin"), email: "chennai.admin@click2ration.gov", pass: "District@123", role: "DISTRICT_ADMIN" as UserRole },
                  { label: t("login.shop_admin"), email: "annanagar.fps@click2ration.gov", pass: "Shop@123", role: "SHOP_ADMIN" as UserRole },
                ].map((d) => (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => fillDemo(d.email, d.pass, d.role)}
                    className="w-full text-left p-2.5 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors group"
                  >
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{d.label}</p>
                    <p className="text-[10px] text-muted-foreground">{d.email} · {d.pass}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
