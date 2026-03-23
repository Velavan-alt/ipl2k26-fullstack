import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { apiLogin, apiRegister, apiGetBalance } from "@/services/api";

const SESSION_KEY = "ipl2k26_session";

interface SessionUser {
  id: number;
  email: string;
  name: string;
  username: string;
  role: "USER" | "ADMIN";
  token: string;
  walletBalance: number;
}

interface AuthContextType {
  user: SessionUser | null;
  login:          (identifier: string, password: string) => Promise<boolean>;
  adminLogin:     (email: string, password: string) => Promise<boolean>;
  signup:         (name: string, username: string, email: string, password: string) => Promise<boolean>;
  logout:         () => void;
  refreshBalance: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

function lsGet<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(() =>
    lsGet<SessionUser | null>(SESSION_KEY, null)
  );

  const persistSession = (u: SessionUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiLogin({ identifier: email.trim(), password });
      if (data.role !== "ADMIN") { toast.error("Invalid admin credentials"); return false; }
      persistSession({ id: 0, email: data.email, name: data.name, username: data.username, role: "ADMIN", token: data.token, walletBalance: 0 });
      toast.success("Welcome back, Admin!");
      return true;
    } catch (e: any) { toast.error(e.message || "Admin login failed"); return false; }
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const data = await apiLogin({ identifier: identifier.trim(), password });
      persistSession({ id: data.id || 0, email: data.email, name: data.name, username: data.username, role: data.role, token: data.token, walletBalance: data.walletBalance || 0 });
      toast.success(`Welcome back, ${data.name}!`);
      return true;
    } catch (e: any) { toast.error(e.message || "Login failed"); return false; }
  };

  const signup = async (name: string, username: string, email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiRegister({ name, username, email, password });
      persistSession({ id: data.id || 0, email: data.email, name: data.name, username: data.username, role: data.role || "USER", token: data.token, walletBalance: data.walletBalance || 0 });
      toast.success(`Account created! Welcome, ${name}!`);
      return true;
    } catch (e: any) { toast.error(e.message || "Signup failed"); return false; }
  };

  const refreshBalance = async () => {
    if (!user || user.role === "ADMIN") return;
    try {
      const data = await apiGetBalance();
      persistSession({ ...user, walletBalance: data.balance });
    } catch { /* silent */ }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, signup, logout, refreshBalance, isAuthenticated: !!user, isAdmin: user?.role === "ADMIN" }}>
      {children}
    </AuthContext.Provider>
  );
};
