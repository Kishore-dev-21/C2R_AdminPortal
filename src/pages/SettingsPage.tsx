import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Bell, Lock, Database } from "lucide-react";

const SettingsPage = () => {
  const { t } = useLanguage();

  const settings = [
    { icon: Shield, title: t("settings.security"), desc: t("settings.security_desc") },
    { icon: Bell, title: t("settings.notifications"), desc: t("settings.notifications_desc") },
    { icon: Lock, title: t("settings.access_control"), desc: t("settings.access_control_desc") },
    { icon: Database, title: t("settings.database"), desc: t("settings.database_desc") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("settings.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("settings.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="metric-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
