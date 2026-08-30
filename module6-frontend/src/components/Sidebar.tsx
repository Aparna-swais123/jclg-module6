'use client';

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  GraduationCap,
  Layers,
  Bell,
  Sparkles,
  CheckSquare,
} from 'lucide-react';
import { getPrincipalProfile, type PrincipalProfileData } from '@/services/api';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'student-monitoring', label: 'Student Monitoring', icon: UserCheck },
  { id: 'faculty-monitoring', label: 'Faculty Monitoring', icon: Users },
  { id: 'academic-performance', label: 'Academic Performance', icon: GraduationCap },
  { id: 'health', label: 'Group Health', icon: Layers },
  { id: 'alerts', label: 'Notifications & Alerts', icon: Bell },
  { id: 'ai-insights', label: 'AI Analysis', icon: Sparkles },
  { id: 'principal-actions', label: 'Principal Actions', icon: CheckSquare },
];

function getInitials(name?: string): string {
  if (!name) return 'PR';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface SidebarProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
}

export function Sidebar({ activeSection, onSelectSection }: SidebarProps) {
  const [profile, setProfile] = useState<PrincipalProfileData['principal'] | null>(null);

  useEffect(() => {
    let mounted = true;
    getPrincipalProfile()
      .then((res) => {
        if (mounted && res?.principal) {
          setProfile(res.principal);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch principal profile:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleNavClick = (id: string) => {
    onSelectSection(id);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const displayName = profile?.full_name || profile?.first_name || 'Principal';
  const roleName = profile?.role_name || 'Principal';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-ink-200/80 bg-white text-ink-900 shadow-sm transition-all duration-300">
      {/* Top Section: Brand Logo & Title */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-ink-200/80 px-5 py-4 bg-white">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-ink-200/80 shadow-xs bg-white">
            <img
              src="/images/college_logo.jpeg"
              alt="SWAIS Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="leading-tight overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-ink-900">SWAIS</span>
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">Principal</span>
            </div>
            <span className="truncate text-[11px] font-medium text-ink-500 block">Demo Junior College</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-400">
            MENU
          </div>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs transition-all duration-150 text-left cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 font-semibold text-white shadow-sm ring-1 ring-brand-500'
                      : 'text-ink-600 font-medium hover:bg-brand-50/60 hover:text-brand-700'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-ink-400 group-hover:text-brand-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Dynamic Principal Profile Card */}
      <div className="border-t border-ink-200/80 bg-ink-50/50 p-3.5">
        <div className="flex items-center gap-3 rounded-xl border border-ink-200/60 bg-white p-2.5 shadow-sm transition-colors hover:bg-ink-50">
          {profile?.profile_photo ? (
            <img
              src={profile.profile_photo}
              alt={displayName}
              className="h-9 w-9 shrink-0 rounded-lg object-cover border border-ink-200"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-sm">
              {getInitials(displayName)}
            </div>
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-xs font-bold text-ink-900" title={displayName}>
              {displayName}
            </div>
            <div className="truncate text-[10px] font-medium text-ink-500">
              {roleName}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
