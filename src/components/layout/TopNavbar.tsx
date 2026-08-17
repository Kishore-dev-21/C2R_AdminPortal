import { Bell, ChevronDown, Shield } from "lucide-react";
import { motion } from "framer-motion";

const TopNavbar = () => {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-foreground">Click2Ration</h1>
            <p className="text-[10px] text-muted-foreground leading-none">National PDS Control Center</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
          <span className="status-dot-green animate-pulse-glow" />
          <span className="text-xs font-medium text-primary">SYSTEM ONLINE</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-md hover:bg-accent transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold flex items-center justify-center text-destructive-foreground">
            7
          </span>
        </motion.button>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            SA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-foreground">Super Admin</p>
            <p className="text-[10px] text-muted-foreground">National Level</p>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
