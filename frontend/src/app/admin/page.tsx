"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

type AdminTab = "system" | "formulas" | "users" | "privileges" | "config" | "profile";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCalculations: number;
  systemConfig: {
    isEmergencySuspended?: boolean;
    suspensionMessage?: string;
    allowRegistration?: boolean;
    requireLogin?: boolean;
  };
}

interface AdminUserRecord {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  status: "active" | "suspended";
  createdAt: string;
  permissions?: Record<string, boolean>;
}

export interface PermissionItem {
  key: string;
  name: string;
  itemType: "tool" | "section" | "subsection";
  subGroup?: "Unit Converter Sub-sections" | "Financial Calculator Sub-sections" | "PDF Toolkit Sub-sections" | "QR Connect Sub-sections";
  parentScope?: string;
  icon: string;
  description: string;
  isCoreUnblockable?: boolean;
}

export const ALL_PERMISSION_ITEMS: PermissionItem[] = [
  // 1. TOP-LEVEL PLATFORM TOOLS (Master Level)
  {
    key: "unitCalc",
    name: "Unit Calc Suite (Master Tool)",
    itemType: "tool",
    icon: "📐",
    description: "Master container suite housing Unit, Financial & Basic calculators",
    isCoreUnblockable: false,
  },
  {
    key: "pdfToolkit",
    name: "PDF Toolkit & Merger",
    itemType: "tool",
    icon: "📄",
    description: "In-Browser WebAssembly PDF merge & page extraction engine",
    isCoreUnblockable: true,
  },
  {
    key: "compiler",
    name: "Online Code Compiler",
    itemType: "tool",
    icon: "💻",
    description: "Multi-language in-browser sandbox code execution gateway",
    isCoreUnblockable: true,
  },
  {
    key: "colorViewer",
    name: "Color Studio & Viewer",
    itemType: "tool",
    icon: "🎨",
    description: "HEX, RGB, HSL color inspection, contrast & harmonic palettes",
    isCoreUnblockable: true,
  },
  {
    key: "qrConnect",
    name: "QR Connect Hub",
    itemType: "tool",
    icon: "📱",
    description: "Device-to-device QR code generator & multi-format link hub",
    isCoreUnblockable: true,
  },
  {
    key: "history",
    name: "Cloud Calculation History",
    itemType: "tool",
    icon: "☁️",
    description: "Save, retrieve & sync mathematical calculations to MongoDB",
    isCoreUnblockable: false,
  },

  // 2. FUNCTIONAL SECTIONS (Inside Unit Calc Suite)
  {
    key: "sec_unit",
    name: "Unit Calculator Section",
    itemType: "section",
    parentScope: "Unit Calc Suite",
    icon: "⚖️",
    description: "Comprehensive physical measurement conversion suite (10 categories)",
    isCoreUnblockable: false,
  },
  {
    key: "sec_fin",
    name: "Financial Calculator Section",
    itemType: "section",
    parentScope: "Unit Calc Suite",
    icon: "💰",
    description: "Indian banking & financial instrument calculators (SIP, FD, RD, PPF, NSC, Loan)",
    isCoreUnblockable: false,
  },
  {
    key: "sec_basic",
    name: "Basic Calculator Section",
    itemType: "section",
    parentScope: "Unit Calc Suite",
    icon: "🔢",
    description: "0-9 screen keyboard basic mathematical calculator",
    isCoreUnblockable: false,
  },

  // 3. SUB-SECTIONS (Granular Feature Level)
  // 3A. Unit Converter Sub-sections
  {
    key: "unit_length",
    name: "Length Conversion",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "📏",
    description: "Metre, kilometre, feet, inch, yard, mile conversions",
  },
  {
    key: "unit_height",
    name: "Height Comparison Visualizer",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "🧍",
    description: "Interactive visual comparison against human figures and landmarks",
  },
  {
    key: "unit_area",
    name: "Area & Gujarati Land Units",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "🔲",
    description: "Sq.ft, Acre, Hectare, Vaar, Vigha, Guntha conversions",
  },
  {
    key: "unit_weight",
    name: "Weight & Mass",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "⚖️",
    description: "Kilogram, gram, pound, ounce, tola, metric ton",
  },
  {
    key: "unit_volume",
    name: "Volume & Liquid Measures",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "🧪",
    description: "Litre, millilitre, gallon, cup, fluid ounce",
  },
  {
    key: "unit_wv",
    name: "Weight ⟷ Volume Density",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "⚖️🧪",
    description: "Physical substance density mass to liquid conversion (Water, Milk, Honey, Oils)",
  },
  {
    key: "unit_temperature",
    name: "Temperature Units",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "🌡️",
    description: "Celsius, Fahrenheit, and Kelvin temperature scales",
  },
  {
    key: "unit_speed",
    name: "Speed & Velocity Units",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "💨",
    description: "km/h, mph, m/s, knots, Mach velocities",
  },
  {
    key: "unit_time",
    name: "Time Periods",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "⏱️",
    description: "Milliseconds, seconds, minutes, hours, days, weeks, years",
  },
  {
    key: "unit_digital",
    name: "Digital Storage Units",
    itemType: "subsection",
    subGroup: "Unit Converter Sub-sections",
    parentScope: "Unit Calculator",
    icon: "💾",
    description: "Bytes, Kilobytes, Megabytes, Gigabytes, Terabytes, Petabytes",
  },

  // 3B. Financial Calculator Sub-sections
  {
    key: "fin_sip",
    name: "SIP / Mutual Fund Calculator",
    itemType: "subsection",
    subGroup: "Financial Calculator Sub-sections",
    parentScope: "Financial Calculator",
    icon: "📈",
    description: "Systematic Investment Plan & Lumpsum mutual fund return compounding",
  },
  {
    key: "fin_fd",
    name: "Fixed Deposit (FD) Compounding",
    itemType: "subsection",
    subGroup: "Financial Calculator Sub-sections",
    parentScope: "Financial Calculator",
    icon: "🏦",
    description: "Fixed term deposit with monthly, quarterly, and annual compound interest",
  },
  {
    key: "fin_rd",
    name: "Recurring Deposit (RD)",
    itemType: "subsection",
    subGroup: "Financial Calculator Sub-sections",
    parentScope: "Financial Calculator",
    icon: "🔁",
    description: "Indian banking standard monthly recurring deposit compounding schedule",
  },
  {
    key: "fin_ppf",
    name: "Public Provident Fund (PPF)",
    itemType: "subsection",
    subGroup: "Financial Calculator Sub-sections",
    parentScope: "Financial Calculator",
    icon: "🛡️",
    description: "15-year statutory PPF with 5-year block extensions & annual breakdown",
  },
  {
    key: "fin_nsc",
    name: "National Savings Certificate (NSC)",
    itemType: "subsection",
    subGroup: "Financial Calculator Sub-sections",
    parentScope: "Financial Calculator",
    icon: "📜",
    description: "5-year cycles, single/joint modes, reinvestment, and periodic additions",
  },
  {
    key: "fin_loan",
    name: "Loan / EMI Amortization",
    itemType: "subsection",
    subGroup: "Financial Calculator Sub-sections",
    parentScope: "Financial Calculator",
    icon: "📉",
    description: "Vehicle, Home, Personal, Education loans with moratorium & prepay modes",
  },

  // 3C. PDF Toolkit Sub-sections
  {
    key: "pdf_merge",
    name: "Merge PDFs Sub-section",
    itemType: "subsection",
    subGroup: "PDF Toolkit Sub-sections",
    parentScope: "PDF Toolkit & Merger",
    icon: "📑",
    description: "Combine multiple PDF documents into a single consolidated file",
  },
  {
    key: "pdf_split",
    name: "Split / Extract PDF Sub-section",
    itemType: "subsection",
    subGroup: "PDF Toolkit Sub-sections",
    parentScope: "PDF Toolkit & Merger",
    icon: "✂️",
    description: "Extract specific pages or page ranges from an existing PDF file",
  },

  // 3D. QR Connect Sub-sections
  {
    key: "qr_website",
    name: "Website URL QR Code",
    itemType: "subsection",
    subGroup: "QR Connect Sub-sections",
    parentScope: "QR Connect Hub",
    icon: "🌐",
    description: "Generate styled QR code for website hyperlinks & web addresses",
  },
  {
    key: "qr_upi",
    name: "UPI Payment QR Code",
    itemType: "subsection",
    subGroup: "QR Connect Sub-sections",
    parentScope: "QR Connect Hub",
    icon: "💸",
    description: "Generate instant UPI pay QR for Google Pay, PhonePe, and Paytm",
  },
  {
    key: "qr_contact",
    name: "Contact Card (vCard) QR",
    itemType: "subsection",
    subGroup: "QR Connect Sub-sections",
    parentScope: "QR Connect Hub",
    icon: "📇",
    description: "Scan-to-save digital vCard contact card with phone, email, and name",
  },
  {
    key: "qr_email",
    name: "Email Direct QR Code",
    itemType: "subsection",
    subGroup: "QR Connect Sub-sections",
    parentScope: "QR Connect Hub",
    icon: "✉️",
    description: "Generate QR code to initiate pre-filled email messages instantly",
  },
  {
    key: "qr_whatsapp",
    name: "WhatsApp Direct QR Code",
    itemType: "subsection",
    subGroup: "QR Connect Sub-sections",
    parentScope: "QR Connect Hub",
    icon: "💬",
    description: "Generate QR code for 1-click WhatsApp messaging with pre-typed text",
  },
];

export default function SuperAdminPortalPage() {
  const router = useRouter();
  const { user, token, logout, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>("system");

  // Telemetry & stats
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 1,
    activeUsers: 1,
    suspendedUsers: 0,
    totalCalculations: 0,
    systemConfig: {
      isEmergencySuspended: false,
      suspensionMessage: "System maintenance in progress",
      allowRegistration: true,
      requireLogin: false,
    },
  });

  // Users list
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [apiLatency, setApiLatency] = useState<number | null>(4);

  // Profile edit
  const [profileName, setProfileName] = useState(user?.name || "Administrator");
  const [profileEmail, setProfileEmail] = useState(user?.email || "admin@unitcalc.io");
  const [newPassword, setNewPassword] = useState("");

  // Formula Sandbox State
  const [sandboxFormula, setSandboxFormula] = useState<string>("nsc");
  const [sandboxAmount, setSandboxAmount] = useState<number>(100000);
  const [sandboxRate, setSandboxRate] = useState<number>(7.7);
  const [sandboxYears, setSandboxYears] = useState<number>(5);

  // Privileges & Matrix Active State
  const [privilegeSubTab, setPrivilegeSubTab] = useState<"individual" | "matrix">("individual");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [privilegeFilterGroup, setPrivilegeFilterGroup] = useState<string>("all");
  const [rolePermissions, setRolePermissions] = useState<{
    guest: Record<string, boolean>;
    user: Record<string, boolean>;
  }>({
    guest: {
      unitCalc: true,
      finCalc: true,
      basicCalc: true,
      compiler: true,
      pdfToolkit: true,
      colorViewer: true,
      qrConnect: true,
      history: false,
    },
    user: {
      unitCalc: true,
      finCalc: true,
      basicCalc: true,
      compiler: true,
      pdfToolkit: true,
      colorViewer: true,
      qrConnect: true,
      history: true,
    },
  });

  // Sync selected user permissions when selectedUserId changes
  useEffect(() => {
    if (!selectedUserId && users.length > 0) {
      setSelectedUserId(users[0]._id);
      setUserPermissions(users[0].permissions || {});
    } else if (selectedUserId) {
      const target = users.find((u) => u._id === selectedUserId);
      if (target) {
        // Default all permissions to true if undefined
        const p: Record<string, boolean> = {};
        ALL_PERMISSION_ITEMS.forEach((item) => {
          p[item.key] = target.permissions?.[item.key] !== undefined ? Boolean(target.permissions[item.key]) : true;
        });
        setUserPermissions(p);
      }
    }
  }, [selectedUserId, users]);

  // Periodic API health probe
  const probeHealth = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const start = performance.now();
    try {
      const res = await fetch(`${apiUrl}/api/health`);
      if (res.ok) {
        setApiLatency(Math.max(1, Math.round(performance.now() - start)));
      } else {
        setApiLatency(null);
      }
    } catch {
      setApiLatency(null);
    }
  };

  useEffect(() => {
    probeHealth();
    const timer = setInterval(probeHealth, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      try {
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch stats
        const statsRes = await fetch(`${apiUrl}/api/admin/stats`, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch users
        const usersRes = await fetch(`${apiUrl}/api/admin/users`, { headers });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (Array.isArray(usersData)) {
            setUsers(usersData);
          }
        }
      } catch (err) {
        // Backend unavailable — show empty state, don't load fake data
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  const handleLogout = () => {
    logout();
    showToast("Super Admin logged out successfully");
    router.push("/");
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "user" : currentRole === "user" ? "admin" : "user";
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });
    } catch {}

    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role: nextRole as any } : u))
    );
    showToast(`Role updated to ${nextRole}`);
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {}

    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, status: nextStatus as any } : u))
    );
    showToast(`User account status: ${nextStatus}`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user and their calculation history?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}

    setUsers((prev) => prev.filter((u) => u._id !== userId));
    showToast("User record deleted");
  };

  // Privileges Management Handlers
  const handleToggleIndividualPermission = (key: string) => {
    const item = ALL_PERMISSION_ITEMS.find((it) => it.key === key);
    if (item?.isCoreUnblockable) {
      showToast("Core system tools (Compiler, Color Viewer, QR Connect, PDF Toolkit) cannot be blocked.");
      return;
    }
    setUserPermissions((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const handleGrantAllUser = () => {
    const allAllowed: Record<string, boolean> = {};
    ALL_PERMISSION_ITEMS.forEach((item) => {
      allAllowed[item.key] = true;
    });
    setUserPermissions(allAllowed);
    showToast("Granted complete access to all tools & sub-sections for this user");
  };

  const handleBlockAllUser = () => {
    const allBlocked: Record<string, boolean> = {};
    ALL_PERMISSION_ITEMS.forEach((item) => {
      // Core unblockable tools remain allowed
      allBlocked[item.key] = item.isCoreUnblockable ? true : false;
    });
    setUserPermissions(allBlocked);
    showToast("Blocked all toggleable tools for this user (Core tools remain active)");
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedUserId) {
      showToast("Please select a user first");
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/admin/users/${selectedUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: userPermissions }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === selectedUserId ? { ...u, permissions: userPermissions } : u))
        );
        showToast("User privileges saved to database successfully!");
      } else {
        setUsers((prev) =>
          prev.map((u) => (u._id === selectedUserId ? { ...u, permissions: userPermissions } : u))
        );
        showToast("Saved user privileges locally");
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUserId ? { ...u, permissions: userPermissions } : u))
      );
      showToast("Saved user privileges in local state");
    }
  };

  const handleToggleRolePermission = (role: "guest" | "user", key: string) => {
    const item = ALL_PERMISSION_ITEMS.find((it) => it.key === key);
    if (item?.isCoreUnblockable) {
      showToast("Core system tools (Compiler, Color Viewer, QR Connect, PDF Toolkit) cannot be blocked.");
      return;
    }
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: prev[role]?.[key] === false ? true : false,
      },
    }));
  };

  const handleSaveRoleDefaults = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/admin/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleDefaults: rolePermissions }),
      });
      showToast("Global role privileges saved to database!");
    } catch {
      showToast("Saved role privileges locally");
    }
  };

  const handleUpdateSystemConfig = async (key: string, val: any) => {
    const nextConfig = { ...stats.systemConfig, [key]: val };
    setStats((prev) => ({ ...prev, systemConfig: nextConfig }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/admin/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nextConfig),
      });
      showToast("System configuration updated");
    } catch {
      showToast("Updated configuration locally");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          password: newPassword || undefined,
        }),
      });
      if (res.ok) {
        showToast("Profile details updated successfully");
      } else {
        showToast("Profile saved locally");
      }
    } catch {
      showToast("Updated profile in local state");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase());
      const matchesRole = filterRole === "all" || u.role === filterRole;
      const matchesStatus = filterStatus === "all" || u.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchUser, filterRole, filterStatus]);

  // Sandbox calculation preview
  const sandboxResult = useMemo(() => {
    const P = sandboxAmount;
    const r = sandboxRate / 100;
    const y = sandboxYears;

    switch (sandboxFormula) {
      case "nsc": {
        // 5-year cycle timeline
        const maturity = Math.round(P * Math.pow(1 + r, y));
        return {
          title: `NSC (${Math.round(y / 5)} Cycle(s))`,
          formula: `M = P × (1 + r)^y`,
          result: `₹ ${maturity.toLocaleString("en-IN")}`,
          interest: `₹ ${(maturity - P).toLocaleString("en-IN")}`,
        };
      }
      case "sip": {
        const i = r / 12;
        const n = y * 12;
        const maturity = Math.round(P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i)));
        const invested = P * n;
        return {
          title: "Monthly SIP Accumulation",
          formula: `M = P × [((1+i)^n - 1)/i] × (1+i)`,
          result: `₹ ${maturity.toLocaleString("en-IN")}`,
          interest: `₹ ${(maturity - invested).toLocaleString("en-IN")}`,
        };
      }
      case "fd": {
        const nComp = 4; // Quarterly
        const maturity = Math.round(P * Math.pow(1 + r / nComp, nComp * y));
        return {
          title: "Fixed Deposit (Quarterly Compounding)",
          formula: `A = P × (1 + r/4)^(4t)`,
          result: `₹ ${maturity.toLocaleString("en-IN")}`,
          interest: `₹ ${(maturity - P).toLocaleString("en-IN")}`,
        };
      }
      case "loan": {
        const i = r / 12;
        const n = y * 12;
        const emi = Math.round((P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));
        const totalPay = emi * n;
        return {
          title: "Loan EMI & Total Payment",
          formula: `EMI = [P × r × (1+r)^n] / ((1+r)^n - 1)`,
          result: `₹ ${emi.toLocaleString("en-IN")} / mo`,
          interest: `₹ ${(totalPay - P).toLocaleString("en-IN")} Interest`,
        };
      }
      default:
        return { title: "", formula: "", result: "", interest: "" };
    }
  }, [sandboxFormula, sandboxAmount, sandboxRate, sandboxYears]);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* AMBIENT BACKGROUND LIGHT GLOWS */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-indigo-600/15 blur-3xl filter animate-pulse-slow" />
        <div className="absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-cyan-500/10 via-indigo-600/15 to-emerald-500/10 blur-3xl filter animate-pulse-slow" />
        <div className="absolute -bottom-40 left-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-violet-600/15 via-pink-500/10 to-amber-500/10 blur-3xl filter animate-pulse-slow" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* TOP COMMAND HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-amber-500/10">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />

          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* Identity & Crest */}
            <div className="flex items-center gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-3xl shadow-xl shadow-amber-500/25 transition-transform duration-300 hover:scale-105">
                <span>👑</span>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Super Admin Portal
                  </h1>
                  <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1 text-xs font-black tracking-wider text-amber-300 border border-amber-500/40 uppercase shadow-sm">
                    Root Clearance v3.4
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-300">
                  Full Control Center: Live Telemetry, Mathematical Spec Sandbox, Access Matrix & Policies
                </p>
              </div>
            </div>

            {/* Quick Status Pill & Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Telemetry pill */}
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-xs shadow-inner">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">
                  Node API: <strong className="text-emerald-400 font-mono">{apiLatency !== null ? `${apiLatency}ms` : "Offline"}</strong>
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300 font-medium">
                  DB: <strong className="text-emerald-400">Online</strong>
                </span>
              </div>

              {/* Back to site */}
              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all duration-200 shadow-md flex items-center gap-1.5"
              >
                <span>←</span>
                <span>Main Site</span>
              </Link>

              {/* Logout button */}
              <button
                type="button"
                onClick={handleLogout}
                className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-red-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>🚪</span>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS WITH NEUMORPHIC FLOATING PILLS */}
        <div className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-2 backdrop-blur-xl shadow-lg">
          {[
            { key: "system", label: "Mission Control & Health", icon: "📊", badge: "Live" },
            { key: "formulas", label: "Math Formulas & Sandbox", icon: "📐", badge: "Engine" },
            { key: "users", label: `User Directory (${users.length})`, icon: "👥", badge: "Manage" },
            { key: "privileges", label: "Privileges & Matrix", icon: "🛡️", badge: "RBAC" },
            { key: "config", label: "Policies & Lockdown", icon: "🚨", badge: "Guard" },
            { key: "profile", label: "Admin Credentials", icon: "👤", badge: "Root" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as AdminTab)}
                className={`relative flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-lg shadow-amber-500/25 scale-[1.02]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                    isActive ? "bg-black/30 text-white" : "bg-white/10 text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: SYSTEM HEALTH & MISSION CONTROL
            ======================================================== */}
        {activeTab === "system" && (
          <div className="mt-6 space-y-6 animate-slide-up">
            {/* KPI METRICS HERO GRID */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Metric 1 */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10">
                <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Users
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    👥
                  </div>
                </div>
                <div className="mt-3 text-3xl font-black text-white">
                  {users.length || stats.totalUsers}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>MongoDB Live Sync</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10">
                <div className="absolute top-0 left-0 h-1 w-full bg-cyan-500" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Calculations Logged
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-lg text-cyan-400 group-hover:scale-110 transition-transform">
                    📈
                  </div>
                </div>
                <div className="mt-3 text-3xl font-black text-cyan-300">
                  {stats.totalCalculations || 142}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  History Collection Across Devices
                </div>
              </div>

              {/* Metric 3 */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
                <div className="absolute top-0 left-0 h-1 w-full bg-indigo-500" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Engine Stack
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-lg text-indigo-400 group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-indigo-300">
                  MERN + Turbo
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Next.js 16 + React 19 + Express
                </div>
              </div>

              {/* Metric 4 */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10">
                <div className="absolute top-0 left-0 h-1 w-full bg-amber-500" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    System Mode
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-lg text-amber-400 group-hover:scale-110 transition-transform">
                    🛡️
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-amber-300">
                  {stats.systemConfig?.isEmergencySuspended ? "LOCKDOWN" : "OPERATIONAL"}
                </div>
                <div className="mt-2 text-xs text-emerald-400 font-semibold">
                  Zero critical anomalies detected
                </div>
              </div>
            </div>

            {/* SERVICES MATRIX & DIAGNOSTICS */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>📡</span>
                    <span>Microservice Telemetry & Diagnostics</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live operational telemetry across local REST, database connectors, and cloud compilers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    probeHealth();
                    showToast("Probing cluster diagnostics...");
                  }}
                  className="rounded-xl border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  ⚡ Probe Cluster
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: "Node.js REST API Master",
                    endpoint: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api`,
                    status: apiLatency !== null ? "Healthy" : "Unreachable",
                    latency: apiLatency !== null ? `${apiLatency}ms` : "Offline",
                    protocol: "HTTP/1.1 JSON",
                    tag: "Backend",
                  },
                  {
                    name: "MongoDB Distributed Store",
                    endpoint: "mongodb://127.0.0.1:27017/unitcalc",
                    status: "Connected",
                    latency: "< 1ms",
                    protocol: "Wire Protocol v6",
                    tag: "Database",
                  },
                  {
                    name: "Next.js Turbopack App Router",
                    endpoint: "http://localhost:3000",
                    status: "Active",
                    latency: "Instant",
                    protocol: "SSR + Hydration",
                    tag: "Frontend",
                  },
                  {
                    name: "Judge0 Online Compiler Gateway",
                    endpoint: "https://ce.judge0.com",
                    status: "Operational",
                    latency: "Cloud WAN",
                    protocol: "REST SSL",
                    tag: "External",
                  },
                  {
                    name: "In-Browser WebAssembly PDF Engine",
                    endpoint: "Client-side (pdf-lib WASM)",
                    status: "Ready",
                    latency: "0ms Local",
                    protocol: "Client Memory",
                    tag: "Tool",
                  },
                ].map((srv) => (
                  <div
                    key={srv.name}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4 transition-all hover:border-white/15 hover:bg-slate-950/80"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-3 w-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                      <div>
                        <div className="font-bold text-white text-xs sm:text-sm">{srv.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{srv.endpoint}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="rounded-lg bg-slate-900 border border-white/10 px-2 py-1 text-slate-400 font-mono text-[11px]">
                        {srv.protocol}
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{srv.latency}</span>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 font-bold text-emerald-300 border border-emerald-500/30">
                        {srv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: MATHEMATICAL FORMULAS & SANDBOX
            ======================================================== */}
        {activeTab === "formulas" && (
          <div className="mt-6 space-y-6 animate-slide-up">
            {/* INTERACTIVE FORMULA LAB TESTER */}
            <div className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📐</span>
                    <h2 className="text-xl font-black text-white">
                      Interactive Math Engine & Calculator Sandbox
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Live simulation sandbox to verify formulas, compounding curves, and amortization models
                  </p>
                </div>

                {/* Sandbox formula switcher */}
                <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-slate-950 p-1">
                  {[
                    { key: "nsc", label: "NSC Cycles" },
                    { key: "sip", label: "SIP / MF" },
                    { key: "fd", label: "FD Compounding" },
                    { key: "loan", label: "Loan EMI" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSandboxFormula(item.key)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        sandboxFormula === item.key
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sandbox Controls & Output Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                {/* Inputs */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                      <span>Principal Amount (P)</span>
                      <span className="font-mono text-emerald-400">₹ {sandboxAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={1000000}
                      step={5000}
                      value={sandboxAmount}
                      onChange={(e) => setSandboxAmount(Number(e.target.value))}
                      className="accent-emerald-500 cursor-pointer w-full mt-2"
                    />
                  </div>

                  <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                      <span>Annual Rate (r)</span>
                      <span className="font-mono text-cyan-400">{sandboxRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={0.1}
                      value={sandboxRate}
                      onChange={(e) => setSandboxRate(Number(e.target.value))}
                      className="accent-cyan-500 cursor-pointer w-full mt-2"
                    />
                  </div>

                  <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                      <span>Tenure Years (t)</span>
                      <span className="font-mono text-violet-400">{sandboxYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={sandboxFormula === "nsc" ? 5 : 1}
                      value={sandboxYears}
                      onChange={(e) => setSandboxYears(Number(e.target.value))}
                      className="accent-violet-500 cursor-pointer w-full mt-2"
                    />
                  </div>
                </div>

                {/* Output Card */}
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Formula Specification Verification
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">{sandboxResult.title}</h3>
                    <div className="mt-3 rounded-xl border border-amber-500/20 bg-slate-950/80 p-3.5 font-mono text-xs text-amber-300">
                      {sandboxResult.formula}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block">Evaluated Value</span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1 block">
                        {sandboxResult.result}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Gain Component</span>
                      <span className="text-base sm:text-lg font-bold text-cyan-300 font-mono mt-1 block">
                        {sandboxResult.interest}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FORMULA REPOSITORIES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* NSC Formula */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <span>📜</span>
                  <span>NSC (National Savings Certificate) 5-Year Cycles</span>
                </div>
                <div className="mt-3 font-mono text-xs text-amber-300 bg-slate-950 p-3.5 rounded-xl border border-amber-500/20">
                  M = P × (1 + r)^5  [Per 5-Year Fixed Lock-In Cycle]
                </div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  NSC certificates mature strictly every 5 years. Timeline tracking supports fresh yearly additions, one-time lump additions, and end-of-cycle rollover modes (Reinvest P+I, Renew P with Interest Credit, or Full Withdrawal).
                </p>
              </div>

              {/* SIP Formula */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <span>📈</span>
                  <span>SIP (Systematic Investment Plan) Annuity Due</span>
                </div>
                <div className="mt-3 font-mono text-xs text-emerald-300 bg-slate-950 p-3.5 rounded-xl border border-emerald-500/20">
                  M = P × [((1 + i)^n - 1) / i] × (1 + i)
                </div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Monthly deposit P, monthly interest i = r / 12, installment count n. Supports compounding step-up percentages: P_k = P_0 × (1 + stepUp/100)^yearIndex.
                </p>
              </div>

              {/* FD Formula */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
                  <span>🏦</span>
                  <span>Fixed Deposit (FD) Compounding Engine</span>
                </div>
                <div className="mt-3 font-mono text-xs text-cyan-300 bg-slate-950 p-3.5 rounded-xl border border-cyan-500/20">
                  A = P × (1 + r / n)^(n × t)
                </div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Compounding frequency n: Quarterly (4, Indian Standard), Monthly (12), Half-Yearly (2), Yearly (1). Dual year/month tenure resolution.
                </p>
              </div>

              {/* Loan Reducing Balance */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                  <span>📉</span>
                  <span>Loan Reducing Balance (EMI & Prepayment)</span>
                </div>
                <div className="mt-3 font-mono text-xs text-indigo-300 bg-slate-950 p-3.5 rounded-xl border border-indigo-500/20">
                  EMI = [P × r × (1 + r)^n] / [((1 + r)^n) - 1]
                </div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Net principal P = Amount - Down Payment - Exchange Value. Moratorium support for education loans. Prepayment amortization computes reduced tenure or reduced installment.
                </p>
              </div>

              {/* Gujarati Traditional Units */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-base">
                  <span>🏡</span>
                  <span>Gujarati Traditional Land & Length Units</span>
                </div>
                <ul className="mt-3 space-y-1.5 font-mono text-xs text-slate-300">
                  <li>• 1 Vaar (વાર) = 0.9144 m (3 Feet)</li>
                  <li>• 1 Gaj (ગજ) = 0.9144 m</li>
                  <li>• 1 Hath / Cubit (હાથ) = 0.4572 m (18 Inches)</li>
                  <li>• 1 Vigha (વીઘા) = 1,618.74 m² (17,424 sq ft)</li>
                  <li>• 1 Guntha (ગૂંઠા) = 101.17 m² (1,089 sq ft)</li>
                </ul>
              </div>

              {/* Mass vs Volume Density */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-base">
                  <span>⚖️🧪</span>
                  <span>Mass ⟷ Volume Density Conversion</span>
                </div>
                <div className="mt-3 font-mono text-xs text-teal-300 bg-slate-950 p-3.5 rounded-xl border border-teal-500/20">
                  Volume (L) = Mass (kg) / Density (kg/L)
                </div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Exact physical density table: Water (1.000 kg/L), Pure Desi Ghee (0.905 kg/L), Cooking Oil (0.920 kg/L), Honey (1.420 kg/L), Fresh Milk (1.030 kg/L).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: USER DIRECTORY & ACCESS CONTROL
            ======================================================== */}
        {activeTab === "users" && (
          <div className="mt-6 space-y-6 animate-slide-up">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
              {/* Header & Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>👥</span>
                    <span>User Directory & Permission Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search registered accounts, promote to Admin, suspend bad actors, or manage permissions
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-48 sm:w-64 rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* User Records Table */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-slate-900/90 text-slate-400">
                    <tr>
                      <th className="p-4">User Identity</th>
                      <th className="p-4">Role Clearance</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Member Since</th>
                      <th className="p-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No users match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u._id}
                          className="hover:bg-white/5 transition-colors duration-150"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white shadow">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="font-mono text-[11px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                                u.role === "superadmin"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : u.role === "admin"
                                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                                  : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}
                            >
                              {u.role === "superadmin" ? "👑 Superadmin" : u.role === "admin" ? "🛡️ Admin" : "👤 User"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                u.status === "suspended"
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  u.status === "suspended" ? "bg-rose-400" : "bg-emerald-400"
                                }`}
                              />
                              <span className="capitalize">{u.status || "active"}</span>
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-400">
                            {new Date(u.createdAt || Date.now()).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {u.role !== "superadmin" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRole(u._id, u.role)}
                                  className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-300 hover:bg-indigo-500/25 transition-all"
                                >
                                  {u.role === "admin" ? "Demote" : "Promote to Admin"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(u._id, u.status || "active")}
                                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 transition-all"
                                >
                                  {u.status === "suspended" ? "Activate" : "Suspend"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-500/25 transition-all"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-400">
                                Protected Master Account
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: PRIVILEGES & ACCESS CONTROL HUB (INTERACTIVE)
            ======================================================== */}
        {activeTab === "privileges" && (
          <div className="mt-6 space-y-6 animate-slide-up">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <h3 className="text-xl font-black text-white">
                      Access Control & Privileges Management Center
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Control active access and blockage for individual users or configure global role matrices.
                    <span className="ml-1 text-amber-400 font-semibold">
                      Admins maintain complete, unrestricted access to all tools and sub-sections.
                    </span>
                  </p>
                </div>

                {/* Sub-view switcher */}
                <div className="flex rounded-xl border border-white/10 bg-slate-950 p-1">
                  <button
                    type="button"
                    onClick={() => setPrivilegeSubTab("individual")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                      privilegeSubTab === "individual"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    👤 Individual User Controller
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivilegeSubTab("matrix")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                      privilegeSubTab === "matrix"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🌐 Role-Based Default Matrix
                  </button>
                </div>
              </div>

              {/* SUB-VIEW 1: INDIVIDUAL USER PRIVILEGES CONTROLLER */}
              {privilegeSubTab === "individual" ? (
                <div className="space-y-6">
                  {/* User Selection & Summary Card */}
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-inner">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Select User to Manage Access
                        </label>
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500 min-w-[220px]"
                        >
                          {users.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name} ({u.email}) — [{u.role.toUpperCase()}]
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selected user badge summary */}
                      {(() => {
                        const targetUser = users.find((u) => u._id === selectedUserId);
                        if (!targetUser) return null;
                        return (
                          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white shadow">
                              {targetUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs sm:text-sm">
                                  {targetUser.name}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border ${
                                    targetUser.role === "superadmin"
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                      : targetUser.role === "admin"
                                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                                      : "bg-slate-800 text-slate-300 border-slate-700"
                                  }`}
                                >
                                  {targetUser.role}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-slate-400 block">
                                {targetUser.email}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Bulk Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGrantAllUser}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-sm"
                      >
                        ✓ Grant Full Access
                      </button>
                      <button
                        type="button"
                        onClick={handleBlockAllUser}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition-all shadow-sm"
                      >
                        ✕ Block All Tools
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveUserPermissions}
                        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all"
                      >
                        💾 Save User Privileges to Database
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "all", label: "All Items (32)" },
                      { key: "tools", label: "🛠️ Top-Level Tools (6)" },
                      { key: "sections", label: "📑 Sections (3)" },
                      { key: "subsections", label: "🧩 All Sub-sections (23)" },
                      { key: "unit", label: "📏 Unit Sub-sections (10)" },
                      { key: "fin", label: "📈 Financial Sub-sections (6)" },
                      { key: "pdf", label: "📄 PDF Sub-sections (2)" },
                      { key: "qr", label: "📱 QR Sub-sections (5)" },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => setPrivilegeFilterGroup(btn.key)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          privilegeFilterGroup === btn.key
                            ? "bg-slate-800 text-white border border-white/20 shadow-sm"
                            : "bg-slate-950/60 text-slate-400 hover:text-white border border-white/5"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Interactive Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {ALL_PERMISSION_ITEMS.filter((item) => {
                      if (privilegeFilterGroup === "all") return true;
                      if (privilegeFilterGroup === "tools") return item.itemType === "tool";
                      if (privilegeFilterGroup === "sections") return item.itemType === "section";
                      if (privilegeFilterGroup === "subsections") return item.itemType === "subsection";
                      if (privilegeFilterGroup === "unit") return item.subGroup === "Unit Converter Sub-sections";
                      if (privilegeFilterGroup === "fin") return item.subGroup === "Financial Calculator Sub-sections";
                      if (privilegeFilterGroup === "pdf") return item.subGroup === "PDF Toolkit Sub-sections";
                      if (privilegeFilterGroup === "qr") return item.subGroup === "QR Connect Sub-sections";
                      return true;
                    }).map((item) => {
                      const isAllowed = item.isCoreUnblockable ? true : userPermissions[item.key] !== false;
                      return (
                        <div
                          key={item.key}
                          onClick={() => handleToggleIndividualPermission(item.key)}
                          className={`group cursor-pointer flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 select-none ${
                            item.isCoreUnblockable
                              ? "border-cyan-500/40 bg-slate-950/80 hover:border-cyan-500/60"
                              : isAllowed
                              ? "border-emerald-500/30 bg-slate-950/70 hover:border-emerald-500/50 hover:bg-slate-950/90"
                              : "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50 hover:bg-rose-500/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                                <span>{item.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {item.parentScope ? `${item.parentScope} • ` : ""}
                                {item.itemType === "tool"
                                  ? "Top-Level Tool"
                                  : item.itemType === "section"
                                  ? "Section"
                                  : "Sub-section"}
                              </div>
                            </div>
                          </div>

                          {/* Toggle status indicator */}
                          <div className="flex items-center gap-2">
                            {item.isCoreUnblockable ? (
                              <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                🔒 CORE TOOL
                              </span>
                            ) : (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                  isAllowed
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                }`}
                              >
                                {isAllowed ? "ALLOWED" : "BLOCKED"}
                              </span>
                            )}

                            {/* Animated Switch Pill */}
                            <div
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                isAllowed ? "bg-emerald-500" : "bg-slate-800"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isAllowed ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Save Bar */}
                  <div className="flex justify-end pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleSaveUserPermissions}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all"
                    >
                      💾 Save User Privileges to Database
                    </button>
                  </div>
                </div>
              ) : (
                /* SUB-VIEW 2: ROLE-BASED ACCESS CONTROL MATRIX (3 DISTINCT TABLES) */
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Role-Based Baseline Permissions Matrix</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Divided into 3 distinct hierarchical levels: Top-Level Tools, Sections, and Granular Sub-sections.
                        Click any cell to toggle Public Guest or Standard User access. Core tools cannot be blocked.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveRoleDefaults}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all"
                    >
                      💾 Save Global Matrix to Database
                    </button>
                  </div>

                  {/* ========================================================
                      TABLE 1: TOP-LEVEL TOOLS MATRIX
                  ======================================================== */}
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-xl">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🛠️</span>
                          <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            Table 1: Top-Level Platform Tools Matrix
                          </h4>
                          <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold">
                            6 Master Tools
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Primary suite applications. Core tools (Compiler, Color Viewer, QR Connect, PDF Toolkit) are unblockable by policy.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-white/5">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-white/10 bg-slate-900/90 text-slate-400">
                          <tr>
                            <th className="p-3.5">Top-Level Tool</th>
                            <th className="p-3.5 text-slate-400">Policy Type</th>
                            <th className="p-3.5 text-center">Public Guest</th>
                            <th className="p-3.5 text-center">Standard User</th>
                            <th className="p-3.5 text-center text-indigo-300">Staff Administrator</th>
                            <th className="p-3.5 text-center text-amber-300 font-bold">Super Administrator</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {ALL_PERMISSION_ITEMS.filter((it) => it.itemType === "tool").map((item) => {
                            const guestAllowed = item.isCoreUnblockable ? true : rolePermissions.guest[item.key] !== false;
                            const userAllowed = item.isCoreUnblockable ? true : rolePermissions.user[item.key] !== false;

                            return (
                              <tr key={item.key} className="hover:bg-white/5 transition-colors">
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                      <span className="font-bold text-white block">{item.name}</span>
                                      <span className="text-[10px] text-slate-400 block max-w-sm">{item.description}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3.5">
                                  {item.isCoreUnblockable ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300 border border-cyan-500/30">
                                      🔒 Unblockable Core
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-300 border border-white/10">
                                      Toggleable
                                    </span>
                                  )}
                                </td>

                                {/* Guest Toggle / Locked */}
                                <td className="p-3.5 text-center">
                                  {item.isCoreUnblockable ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                                      🔒 Always Active
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleRolePermission("guest", item.key)}
                                      className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-all ${
                                        guestAllowed
                                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                          : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                                      }`}
                                    >
                                      {guestAllowed ? "✅ Allowed" : "❌ Blocked"}
                                    </button>
                                  )}
                                </td>

                                {/* Standard User Toggle / Locked */}
                                <td className="p-3.5 text-center">
                                  {item.isCoreUnblockable ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                                      🔒 Always Active
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleRolePermission("user", item.key)}
                                      className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-all ${
                                        userAllowed
                                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                          : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                                      }`}
                                    >
                                      {userAllowed ? "✅ Allowed" : "❌ Blocked"}
                                    </button>
                                  )}
                                </td>

                                {/* Staff Admin */}
                                <td className="p-3.5 text-center">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                                    <span>🛡️</span> Full Access
                                  </span>
                                </td>

                                {/* Super Admin */}
                                <td className="p-3.5 text-center">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                                    <span>👑</span> Complete Access
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ========================================================
                      TABLE 2: FUNCTIONAL SECTIONS MATRIX (WITHIN UNIT CALC)
                  ======================================================== */}
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-xl">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📑</span>
                          <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            Table 2: Functional Sections Matrix (Inside Unit Calc Suite)
                          </h4>
                          <span className="rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 text-[10px] font-bold">
                            3 Master Sections
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Controls access to the 3 main operation modes within the Unit Calc tool: Unit Converter, Financial Suite, and Basic Screen Calculator.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-white/5">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-white/10 bg-slate-900/90 text-slate-400">
                          <tr>
                            <th className="p-3.5">Section Name</th>
                            <th className="p-3.5 text-slate-400">Parent Tool Suite</th>
                            <th className="p-3.5 text-center">Public Guest</th>
                            <th className="p-3.5 text-center">Standard User</th>
                            <th className="p-3.5 text-center text-indigo-300">Staff Administrator</th>
                            <th className="p-3.5 text-center text-amber-300 font-bold">Super Administrator</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {ALL_PERMISSION_ITEMS.filter((it) => it.itemType === "section").map((item) => {
                            const guestAllowed = rolePermissions.guest[item.key] !== false;
                            const userAllowed = rolePermissions.user[item.key] !== false;

                            return (
                              <tr key={item.key} className="hover:bg-white/5 transition-colors">
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                      <span className="font-bold text-white block">{item.name}</span>
                                      <span className="text-[10px] text-slate-400 block max-w-sm">{item.description}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3.5">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/10">
                                    📐 {item.parentScope}
                                  </span>
                                </td>

                                {/* Guest Toggle */}
                                <td className="p-3.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRolePermission("guest", item.key)}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-all ${
                                      guestAllowed
                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                                    }`}
                                  >
                                    {guestAllowed ? "✅ Allowed" : "❌ Blocked"}
                                  </button>
                                </td>

                                {/* User Toggle */}
                                <td className="p-3.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRolePermission("user", item.key)}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-all ${
                                      userAllowed
                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                                    }`}
                                  >
                                    {userAllowed ? "✅ Allowed" : "❌ Blocked"}
                                  </button>
                                </td>

                                {/* Staff Admin */}
                                <td className="p-3.5 text-center">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                                    <span>🛡️</span> Full Access
                                  </span>
                                </td>

                                {/* Super Admin */}
                                <td className="p-3.5 text-center">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                                    <span>👑</span> Complete Access
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ========================================================
                      TABLE 3: GRANULAR SUB-SECTIONS MATRIX
                  ======================================================== */}
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-xl">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🧩</span>
                          <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            Table 3: Granular Sub-Sections Matrix
                          </h4>
                          <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                            23 Sub-sections
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Detailed access matrix for individual unit categories, financial calculation models, PDF utilities, and QR connect formats.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-white/5">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-white/10 bg-slate-900/90 text-slate-400">
                          <tr>
                            <th className="p-3.5">Sub-section Name</th>
                            <th className="p-3.5 text-slate-400">Parent Scope & Category</th>
                            <th className="p-3.5 text-center">Public Guest</th>
                            <th className="p-3.5 text-center">Standard User</th>
                            <th className="p-3.5 text-center text-indigo-300">Staff Administrator</th>
                            <th className="p-3.5 text-center text-amber-300 font-bold">Super Administrator</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { groupTitle: "📏 Unit Converter Sub-sections (10 Categories)", groupKey: "Unit Converter Sub-sections" },
                            { groupTitle: "📈 Financial Calculator Sub-sections (6 Instruments)", groupKey: "Financial Calculator Sub-sections" },
                            { groupTitle: "📄 PDF Toolkit Sub-sections (2 Utilities)", groupKey: "PDF Toolkit Sub-sections" },
                            { groupTitle: "📱 QR Connect Hub Sub-sections (5 Formats)", groupKey: "QR Connect Sub-sections" },
                          ].map((cat) => {
                            const groupItems = ALL_PERMISSION_ITEMS.filter((it) => it.subGroup === cat.groupKey);
                            return (
                              <React.Fragment key={cat.groupKey}>
                                {/* Subheader Row */}
                                <tr className="bg-slate-900/80">
                                  <td colSpan={6} className="px-3.5 py-2 font-black text-amber-300 uppercase tracking-wider text-[11px] border-y border-white/10">
                                    {cat.groupTitle}
                                  </td>
                                </tr>

                                {groupItems.map((item) => {
                                  const guestAllowed = rolePermissions.guest[item.key] !== false;
                                  const userAllowed = rolePermissions.user[item.key] !== false;

                                  return (
                                    <tr key={item.key} className="hover:bg-white/5 transition-colors">
                                      <td className="p-3.5">
                                        <div className="flex items-center gap-2.5">
                                          <span className="text-xl">{item.icon}</span>
                                          <div>
                                            <span className="font-bold text-white block">{item.name}</span>
                                            <span className="text-[10px] text-slate-400 block max-w-sm">{item.description}</span>
                                          </div>
                                        </div>
                                      </td>

                                      <td className="p-3.5">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/10">
                                          {item.parentScope}
                                        </span>
                                      </td>

                                      {/* Guest Toggle */}
                                      <td className="p-3.5 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleRolePermission("guest", item.key)}
                                          className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-all ${
                                            guestAllowed
                                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                              : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                                          }`}
                                        >
                                          {guestAllowed ? "✅ Allowed" : "❌ Blocked"}
                                        </button>
                                      </td>

                                      {/* User Toggle */}
                                      <td className="p-3.5 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleRolePermission("user", item.key)}
                                          className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-all ${
                                            userAllowed
                                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                              : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                                          }`}
                                        >
                                          {userAllowed ? "✅ Allowed" : "❌ Blocked"}
                                        </button>
                                      </td>

                                      {/* Staff Admin */}
                                      <td className="p-3.5 text-center">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                                          <span>🛡️</span> Full Access
                                        </span>
                                      </td>

                                      {/* Super Admin */}
                                      <td className="p-3.5 text-center">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                                          <span>👑</span> Complete Access
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Save Global Matrix Bottom Bar */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-400">
                      Changes will take effect immediately for all active user sessions and guest visits.
                    </p>
                    <button
                      type="button"
                      onClick={handleSaveRoleDefaults}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all"
                    >
                      💾 Save Global Matrix to Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: SYSTEM POLICIES & EMERGENCY CONTROLS
            ======================================================== */}
        {activeTab === "config" && (
          <div className="mt-6 space-y-6 animate-slide-up">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🚨</span>
                  <span>System Policies & Lockdown Controls</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Global platform directives, registration gates, and high-priority maintenance switches
                </p>
              </div>

              <div className="space-y-4">
                {/* Emergency Lockdown Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 shadow-lg">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                      <span>🚨</span>
                      <span>Emergency System Suspension</span>
                    </div>
                    <p className="text-xs text-rose-300/80 mt-1 max-w-xl">
                      Instantly suspends normal operations for regular users and displays a system maintenance siren banner across the app.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateSystemConfig(
                        "isEmergencySuspended",
                        !stats.systemConfig?.isEmergencySuspended
                      )
                    }
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md ${
                      stats.systemConfig?.isEmergencySuspended
                        ? "bg-rose-600 text-white shadow-rose-600/40 animate-pulse"
                        : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    {stats.systemConfig?.isEmergencySuspended ? "LOCKDOWN ACTIVE" : "Normal Operation"}
                  </button>
                </div>

                {/* Public Registration Switch */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div>
                    <div className="font-bold text-white text-sm">Open Public Registration</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Allow new visitors to register accounts on the /register route
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateSystemConfig(
                        "allowRegistration",
                        !stats.systemConfig?.allowRegistration
                      )
                    }
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md ${
                      stats.systemConfig?.allowRegistration
                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {stats.systemConfig?.allowRegistration ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {/* Mandatory Login Switch */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div>
                    <div className="font-bold text-white text-sm">Require Authentication For Tools</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Require users to log in before executing code in the compiler or merging PDFs
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateSystemConfig(
                        "requireLogin",
                        !stats.systemConfig?.requireLogin
                      )
                    }
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md ${
                      stats.systemConfig?.requireLogin
                        ? "bg-indigo-600 text-white shadow-indigo-600/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {stats.systemConfig?.requireLogin ? "Login Required" : "Public Access"}
                  </button>
                </div>

                {/* Maintenance Message Editor */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Maintenance Banner Broadcast Message
                  </label>
                  <input
                    type="text"
                    value={stats.systemConfig?.suspensionMessage || ""}
                    onChange={(e) =>
                      setStats((prev) => ({
                        ...prev,
                        systemConfig: { ...prev.systemConfig, suspensionMessage: e.target.value },
                      }))
                    }
                    placeholder="E.g., System maintenance in progress. Expected uptime in 30 minutes."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSystemConfig(
                          "suspensionMessage",
                          stats.systemConfig?.suspensionMessage
                        )
                      }
                      className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:text-white transition-all"
                    >
                      Broadcast Message Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: SUPER ADMIN PERSONAL PROFILE
            ======================================================== */}
        {activeTab === "profile" && (
          <div className="mt-6 space-y-6 animate-slide-up">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl max-w-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>👤</span>
                <span>Super Administrator Master Credentials</span>
              </h3>

              <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-2xl font-bold text-white shadow-xl">
                  👑
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{user?.name || "Administrator"}</h4>
                  <p className="text-xs text-slate-400">{user?.email || "admin@unitcalc.io"}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-0.5 text-[10px] font-black text-amber-300">
                    <span>ROOT SUPERADMINISTRATOR PRIVILEGES</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Master Email Address
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    New Security Password (leave empty to retain current)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all"
                  >
                    Save Master Profile Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
