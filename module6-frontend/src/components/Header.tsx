import { useState } from 'react';
import { Calendar, ChevronDown, LogOut } from 'lucide-react';
import type { AlertCategory } from '@/types';

export function TopHeader({
  collegeName = 'SWAIS Demo Junior College',
  subtitle = 'Principal Dashboard',
}: {
  collegeName?: string;
  subtitle?: string;
  alertCount?: number;
}) {
  const [academicYear, setAcademicYear] = useState('AY 2026–27');
  const [openDropdown, setOpenDropdown] = useState(false);

  const academicYears = ['AY 2026–27', 'AY 2025–26', 'AY 2024–25'];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-ink-200/80 bg-white px-8 shadow-sm">
      {/* Left: College Name & Principal Role */}
      <div>
        <h1 className="text-base font-bold tracking-tight text-ink-900">{collegeName}</h1>
        <p className="text-xs text-ink-500 font-medium">{subtitle}</p>
      </div>

      {/* Right: Academic Year Selector + Logout */}
      <div className="flex items-center gap-3">
        {/* Academic Year Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-bold text-ink-800 shadow-2xs transition-all hover:bg-ink-50 hover:border-ink-300"
          >
            <Calendar className="h-3.5 w-3.5 text-brand-600" />
            <span>{academicYear}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-ink-400 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-ink-200 bg-white py-1.5 shadow-lg z-50 animate-slide-down">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
                Select Year
              </div>
              {academicYears.map((ay) => (
                <button
                  key={ay}
                  type="button"
                  onClick={() => {
                    setAcademicYear(ay);
                    setOpenDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold transition-colors ${
                    academicYear === ay ? 'bg-brand-50 text-brand-700 font-bold' : 'text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  <span>{ay}</span>
                  {academicYear === ay && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to log out?')) {
              window.location.reload();
            }
          }}
          className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-2xs transition-all hover:bg-ink-50 hover:text-ink-900 active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5 text-ink-500" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export function FilterBar() {
  const filters = [
    { label: 'Academic Year', value: '2026–27' },
    { label: 'Group', value: 'All Groups' },
    { label: 'Section', value: 'All Sections' },
    { label: 'Date', value: 'Today' },
    { label: 'Examination', value: 'Select Examination', muted: true },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {filters.map((f) => (
        <button
          key={f.label}
          className="group flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
        >
          <span className="text-[10px] font-bold uppercase tracking-wide text-ink-400">{f.label}</span>
          <span className={`text-xs font-semibold ${f.muted ? 'text-ink-400' : 'text-ink-800'}`}>{f.value}</span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-400 transition-transform group-hover:translate-y-0.5" />
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <button className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-50">
          Reset
        </button>
        <button className="rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700">
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export function AlertsSummary({
  categories,
  total,
  onCategoryClick,
  active,
}: {
  categories: AlertCategory[];
  total: number;
  onCategoryClick?: (key: string) => void;
  active?: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-3 shadow-card">
      <div className="flex items-center gap-2.5 pr-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger-50 text-danger-600 ring-1 ring-danger-100">
          <Bell className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-extrabold text-ink-900">{total}</div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Active Alerts</div>
        </div>
      </div>
      <div className="h-9 w-px bg-ink-200" />
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => {
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onCategoryClick?.(c.key)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors ${
                isActive ? 'border-brand-300 bg-brand-50' : 'border-ink-200 bg-white hover:bg-ink-50'
              }`}
            >
              <span className={`h-2 w-2 rounded-full bg-${c.color}-500`} />
              <span className="text-xs font-semibold text-ink-700">{c.label}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white bg-${c.color}-500`}>{c.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
