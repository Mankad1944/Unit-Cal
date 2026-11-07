"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  createdAt: string;
}

export function AdminDashboard() {
  const { user, token, adminDashboardOpen, setAdminDashboardOpen, showToast } = useApp();
  const [users, setUsers] = useState<AdminUser[]>([
    { _id: "1", name: "Admin User", email: "admin@unitcalc.io", role: "superadmin", createdAt: "2026-01-01" },
    { _id: "2", name: "Jane Smith", email: "jane@example.com", role: "user", createdAt: "2026-02-14" },
    { _id: "3", name: "Raj Patel", email: "raj@gujarat.in", role: "user", createdAt: "2026-03-20" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!adminDashboardOpen) return;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setUsers(data);
        }
      } catch (err) {
        // Fallback to initial mock data
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [adminDashboardOpen, token]);

  if (!adminDashboardOpen || !user) return null;

  const toggleRole = (userId: string) => {
    let updatedRole = "";
    setUsers((prev) =>
      prev.map((u) => {
        if (u._id === userId) {
          updatedRole = u.role === "admin" ? "user" : "admin";
          return { ...u, role: updatedRole as any };
        }
        return u;
      })
    );
    if (updatedRole) {
      showToast(`Updated role to ${updatedRole}`);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u._id !== userId));
    showToast("User removed");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-2xl shadow-lg">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Admin Control Center</h2>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage user accounts, permissions, and platform metrics</p>
            </div>
          </div>
          <button
            onClick={() => setAdminDashboardOpen(false)}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Stats Row */}
        <div className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-slate-800/40 p-4">
            <div className="text-xs text-slate-400">Total Users</div>
            <div className="text-2xl font-bold text-white mt-1">{users.length}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-slate-800/40 p-4">
            <div className="text-xs text-slate-400">Backend Status</div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-slate-800/40 p-4">
            <div className="text-xs text-slate-400">Active Modules</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">7 Tools</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-slate-800/40 p-4">
            <div className="text-xs text-slate-400">DB Engine</div>
            <div className="text-sm font-bold text-slate-200 mt-2">MongoDB MERN</div>
          </div>
        </div>

        {/* User Management Table */}
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Registered Platform Users</h3>
        <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/40">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-800/50 text-slate-400">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-slate-400 text-[11px]">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        u.role === "superadmin"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : u.role === "admin"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-slate-700/50 text-slate-300 border-slate-600/30"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {u.role !== "superadmin" && (
                      <>
                        <button
                          onClick={() => toggleRole(u._id)}
                          className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/20"
                        >
                          {u.role === "admin" ? "Demote" : "Promote"}
                        </button>
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/20"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <a
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:opacity-95 transition-all"
          >
            <span>👑</span>
            <span>Launch Full Super Admin Portal →</span>
          </a>
          <button
            onClick={() => setAdminDashboardOpen(false)}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;
