import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ListTodo, Layout, Briefcase,
  CalendarCheck, LogOut, User, ChevronLeft, ChevronRight, Menu, UserCircle
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard,  label: 'Dashboard'    },
  { to: '/my-tasks',   icon: ListTodo,          label: 'My Tasks'     },
  { to: '/kanban',     icon: Layout,            label: 'Kanban Board' },
  { to: '/projects',   icon: Briefcase,         label: 'Projects'     },
  { to: '/attendance', icon: CalendarCheck,     label: 'Attendance'   },
  { to: '/profile',    icon: UserCircle,        label: 'My Profile'   },
];

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border border-blue-500/50">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-tight">Employee Portal</p>
            <p className="text-slate-500 text-xs">Work Management</p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-slate-700/30 rounded-xl border border-slate-700">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.designation || user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-colors border border-transparent hover:border-rose-500/20 text-sm ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-slate-800 border-r border-slate-700 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-3 flex-shrink-0">
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          {/* Desktop collapse toggle */}
          <button onClick={() => setCollapsed(c => !c)} className="hidden md:flex p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Active page title from nav */}
          <div className="flex-1" />

          {/* User chip — links to profile */}
          <NavLink to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/20 border-blue-600/30 text-blue-400'
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-600/30 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
            <span className="text-slate-500 text-xs hidden sm:block">{user?.emp_id || ''}</span>
          </NavLink>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
