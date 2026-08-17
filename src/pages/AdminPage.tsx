import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus } from "lucide-react";

const admins = [
  { name: "Rajesh Kumar", email: "rajesh@pds.gov.in", role: "SUPER_ADMIN", district: "All", shop: "All", status: "Active" },
  { name: "Priya Sharma", email: "priya@pds.gov.in", role: "DISTRICT_ADMIN", district: "Chennai", shop: "All", status: "Active" },
  { name: "Karthik V", email: "karthik@pds.gov.in", role: "DISTRICT_ADMIN", district: "Madurai", shop: "All", status: "Active" },
  { name: "Anitha R", email: "anitha@pds.gov.in", role: "SHOP_ADMIN", district: "Chennai", shop: "Anna Nagar FPS", status: "Active" },
  { name: "Senthil M", email: "senthil@pds.gov.in", role: "SHOP_ADMIN", district: "Coimbatore", shop: "Coimbatore Central FPS", status: "Inactive" },
];

const roleStyles = {
  SUPER_ADMIN: "bg-primary/20 text-primary",
  DISTRICT_ADMIN: "bg-info/20 text-info",
  SHOP_ADMIN: "bg-warning/20 text-warning",
};

const AdminPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("admin.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> {t("admin.add")}
        </button>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="command-panel">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>{t("common.name")}</th><th>{t("admin.email")}</th><th>{t("admin.role")}</th><th>{t("common.district")}</th><th>{t("common.shop")}</th><th>{t("common.status")}</th></tr></thead>
            <tbody>
              {admins.map((a, i) => (
                <tr key={i}>
                  <td className="font-medium">{a.name}</td>
                  <td className="text-xs text-muted-foreground">{a.email}</td>
                  <td><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${roleStyles[a.role as keyof typeof roleStyles]}`}>{a.role}</span></td>
                  <td>{a.district}</td>
                  <td className="text-xs">{a.shop}</td>
                  <td><span className={`text-xs font-medium ${a.status === "Active" ? "text-success" : "text-muted-foreground"}`}>{a.status === "Active" ? t("common.active") : t("common.inactive")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPage;
