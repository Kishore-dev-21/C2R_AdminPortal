import { Outlet, Navigate } from "react-router-dom";
import RoleTopNavbar from "./RoleTopNavbar";
import RoleSidebar from "./RoleSidebar";
import AlertPanel from "./AlertPanel";
import { useAuth } from "@/contexts/AuthContext";

const RoleDashboardLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RoleTopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <RoleSidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
        <AlertPanel />
      </div>
    </div>
  );
};

export default RoleDashboardLayout;
