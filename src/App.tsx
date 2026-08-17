import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import RoleDashboardLayout from "@/components/layout/RoleDashboardLayout";
import LoginPage from "@/pages/LoginPage";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import DistrictAdminDashboard from "@/pages/DistrictAdminDashboard";
import ShopAdminDashboard from "@/pages/ShopAdminDashboard";
import ShopDeliveryDashboard from "@/pages/ShopDeliveryDashboard";
import ShopDeliveryManagement from "@/pages/ShopDeliveryManagement";
import DistrictsPage from "@/pages/DistrictsPage";
import WarehousesPage from "@/pages/WarehousesPage";
import ShopsPage from "@/pages/ShopsPage";
import OrdersPage from "@/pages/OrdersPage";
import InventoryPage from "@/pages/InventoryPage";
import FraudPage from "@/pages/FraudPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AdminPage from "@/pages/AdminPage";
import LogsPage from "@/pages/LogsPage";
import SettingsPage from "@/pages/SettingsPage";
import BlockchainAuditDashboard from "@/pages/BlockchainAuditDashboard";
import BlockchainExplorerPage from "@/pages/BlockchainExplorerPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route element={<RoleDashboardLayout />}>
                  <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
                  <Route path="/district-admin-dashboard" element={<DistrictAdminDashboard />} />
                  <Route path="/shop-admin-dashboard" element={<ShopAdminDashboard />} />
                  <Route path="/shop-delivery-dashboard" element={<ShopDeliveryDashboard />} />
                  <Route path="/shop-delivery-management" element={<ShopDeliveryManagement />} />
                  <Route path="/districts" element={<DistrictsPage />} />
                  <Route path="/warehouses" element={<WarehousesPage />} />
                  <Route path="/shops" element={<ShopsPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/fraud" element={<FraudPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/logs" element={<LogsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/blockchain-audit" element={<BlockchainAuditDashboard />} />
                  <Route path="/blockchain-explorer" element={<BlockchainExplorerPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
