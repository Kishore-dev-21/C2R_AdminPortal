import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export type UserRole = "SUPER_ADMIN" | "DISTRICT_ADMIN" | "SHOP_ADMIN";

export interface User {
  email: string;
  name: string;
  role: UserRole;
  district?: string;
  shop?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const demoAccounts: { email: string; password: string; role: UserRole; name: string; district?: string; shop?: string }[] = [
  { email: "superadmin@click2ration.gov", password: "Admin@123", role: "SUPER_ADMIN", name: "Super Admin" },
  { email: "chennai.admin@click2ration.gov", password: "District@123", role: "DISTRICT_ADMIN", name: "Chennai District Admin", district: "Chennai" },
  { email: "madurai.admin@click2ration.gov", password: "District@123", role: "DISTRICT_ADMIN", name: "Madurai District Admin", district: "Madurai" },
  { email: "annanagar.fps@click2ration.gov", password: "Shop@123", role: "SHOP_ADMIN", name: "Anna Nagar FPS Admin", district: "Chennai", shop: "Anna Nagar FPS" },
  { email: "kknagar.fps@click2ration.gov", password: "Shop@123", role: "SHOP_ADMIN", name: "KK Nagar FPS Admin", district: "Chennai", shop: "KK Nagar FPS" },
  { email: "madurai.fps@click2ration.gov", password: "Shop@123", role: "SHOP_ADMIN", name: "Madurai Main FPS Admin", district: "Madurai", shop: "Madurai Main FPS" },
];

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("pds_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email: string, password: string, role: UserRole) => {
    const account = demoAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password && a.role === role
    );
    if (!account) {
      return { success: false, error: "Invalid credentials or role mismatch" };
    }
    const u: User = { email: account.email, name: account.name, role: account.role, district: account.district, shop: account.shop };
    setUser(u);
    localStorage.setItem("pds_user", JSON.stringify(u));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pds_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
