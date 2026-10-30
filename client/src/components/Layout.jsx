import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookHeart,
  Sparkles,
  ShieldCheck,
  Inbox,
  ScrollText,
  UserCircle2,
  DownloadCloud,
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ToastHost } from "./ui.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/memories", label: "Memory Vault", icon: BookHeart },
  { to: "/ai", label: "EchoMind AI", icon: Sparkles },
  { to: "/access", label: "Legacy Access", icon: ShieldCheck },
  { to: "/incoming", label: "Incoming Access", icon: Inbox },
  { to: "/audit", label: "Audit Log", icon: ScrollText },
  { to: "/profile", label: "Legacy Profile", icon: UserCircle2 },
  { to: "/export", label: "Export", icon: DownloadCloud },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="flex-1 px-3 space-y-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors focus-ring ${
              isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-primary/5 hover:text-primary"
            }`
          }
        >
          <Icon size={18} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-100 bg-white h-screen sticky top-0">
        <div className="px-5 py-6 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-accent font-bold">E</div>
          <span className="text-lg font-bold text-primary">EchoMind</span>
        </div>
        <NavItems />
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.avatar || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus-ring"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-100 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-accent font-bold text-sm">E</div>
          <span className="font-bold text-primary">EchoMind</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 focus-ring rounded-lg" aria-label="Open menu">
          <Menu size={22} className="text-primary" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-white h-full flex flex-col animate-fade-in">
            <div className="px-5 py-5 flex items-center justify-between">
              <span className="text-lg font-bold text-primary">EchoMind</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 focus-ring rounded-lg" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <NavItems onNavigate={() => setMobileOpen(false)} />
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus-ring"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">{children}</div>
      </main>
      <ToastHost />
    </div>
  );
}
