"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Language, Theme, AppMode, UnitCategory, User, HistoryItem } from "@/types/calculator";
import { getTranslations } from "@/lib/i18n/translations";

interface AppContextType {
  language: Language;
  toggleLanguage: () => void;
  theme: Theme;
  toggleTheme: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  unitCategory: UnitCategory;
  setUnitCategory: (cat: UnitCategory) => void;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  dashboardOpen: boolean;
  setDashboardOpen: (open: boolean) => void;
  adminDashboardOpen: boolean;
  setAdminDashboardOpen: (open: boolean) => void;
  history: HistoryItem[];
  addHistory: (item: { category: string; title: string; expression?: string; result: string }) => Promise<void>;
  clearHistory: () => Promise<void>;
  toast: string | null;
  showToast: (msg: string) => void;
  t: ReturnType<typeof getTranslations>;
  systemConfig: any;
  refreshSystemConfig: () => Promise<void>;
  hasPermission: (featureKey: string) => boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [mode, setMode] = useState<AppMode>("unit");
  const [unitCategory, setUnitCategory] = useState<UnitCategory>("length");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [systemConfig, setSystemConfig] = useState<any>(null);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("unitcalc_lang") as Language;
      if (savedLang) setLanguage(savedLang);

      const savedTheme = localStorage.getItem("unitcalc_theme") as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("light", savedTheme === "light");
        document.body.classList.toggle("light", savedTheme === "light");
      }

      const savedToken = localStorage.getItem("unitcalc_token");
      const savedUser = localStorage.getItem("unitcalc_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }

      const savedHistory = localStorage.getItem("unitcalc_history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      if (savedToken) {
        fetchCloudHistory(savedToken);
      }
    } catch (e) {
      console.error("Local storage load error", e);
    }
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/config/public`);
      if (res.ok) {
        const data = await res.json();
        setSystemConfig(data);
      }
    } catch {}
  };

  const hasPermission = (featureKey: string): boolean => {
    // 0. Core unblockable tools cannot be blocked by admin or policy
    if (
      featureKey === "compiler" ||
      featureKey === "colorViewer" ||
      featureKey === "qrConnect" ||
      featureKey === "pdfToolkit"
    ) {
      return true;
    }

    // 1. Admin and SuperAdmin have complete, unrestricted access to all tools, sections, and sub-sections
    if (user?.role === "superadmin" || user?.role === "admin") {
      return true;
    }

    // 2. Emergency lockdown restricts regular users & guests
    if (systemConfig?.isEmergencySuspended) {
      return false;
    }

    // 3. Check individual user custom permissions override if logged in
    if (user && user.permissions && user.permissions[featureKey] !== undefined) {
      return Boolean(user.permissions[featureKey]);
    }

    // 4. Check global tool availability in system config
    if (systemConfig?.globalToolAvailability && systemConfig.globalToolAvailability[featureKey] !== undefined) {
      return Boolean(systemConfig.globalToolAvailability[featureKey]);
    }

    // 5. Check role-based defaults
    const currentRole = user ? user.role : "guest";
    if (systemConfig?.roleDefaults?.[currentRole]?.[featureKey] !== undefined) {
      return Boolean(systemConfig.roleDefaults[currentRole][featureKey]);
    }

    // Default to allowed
    return true;
  };

  const fetchCloudHistory = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/history`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          setHistory(cloudData);
          localStorage.setItem("unitcalc_history", JSON.stringify(cloudData));
        }
      }
    } catch (e) {
      // offline or silent fallback
    }
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "gu" : "en";
    setLanguage(next);
    localStorage.setItem("unitcalc_lang", next);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("unitcalc_theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    document.body.classList.toggle("light", next === "light");
  };

  const loginUser = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("unitcalc_token", newToken);
    localStorage.setItem("unitcalc_user", JSON.stringify(newUser));
    fetchCloudHistory(newToken);
    showToast(`Welcome, ${newUser.name}!`);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("unitcalc_token");
    localStorage.removeItem("unitcalc_user");
    setDashboardOpen(false);
    setAdminDashboardOpen(false);
    showToast("Logged out successfully");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const addHistory = async (item: { category: string; title: string; expression?: string; result: string }) => {
    let cloudId = undefined;
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/api/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        });
        if (res.ok) {
          const savedData = await res.json();
          cloudId = savedData._id;
        }
      } catch (err) {}
    }

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      _id: cloudId,
      ...item,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("unitcalc_history", JSON.stringify(updated));
  };

  const clearHistory = async () => {
    setHistory([]);
    localStorage.removeItem("unitcalc_history");
    if (token) {
      try {
        await fetch(`${API_BASE}/api/history/clear`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}
    }
    showToast("History cleared");
  };

  const t = getTranslations(language);

  return (
    <AppContext.Provider
      value={{
        language,
        toggleLanguage,
        theme,
        toggleTheme,
        mode,
        setMode,
        unitCategory,
        setUnitCategory,
        user,
        token,
        login: loginUser,
        logout,
        authModalOpen,
        setAuthModalOpen,
        dashboardOpen,
        setDashboardOpen,
        adminDashboardOpen,
        setAdminDashboardOpen,
        history,
        addHistory,
        clearHistory,
        toast,
        showToast,
        t,
        systemConfig,
        refreshSystemConfig: fetchSystemConfig,
        hasPermission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
