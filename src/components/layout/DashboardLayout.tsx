import { Outlet } from "react-router-dom";
import TopNavbar from "./TopNavbar";
import AppSidebar from "./AppSidebar";
import AlertPanel from "./AlertPanel";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
        <AlertPanel />
      </div>
    </div>
  );
};

export default DashboardLayout;
