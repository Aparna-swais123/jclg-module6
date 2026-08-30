'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Info, Loader2 } from 'lucide-react';
import { Card, Pill, ProgressBar, SectionHeader } from '@/components/ui';
import { getFacultySyllabus, type FacultySyllabusItem } from '@/services/api';

const statusConfig: Record<string, { label: string; color: 'success' | 'brand' | 'warning' | 'danger' }> = {
  AHEAD_OF_SCHEDULE: { label: 'Ahead of Schedule', color: 'success' },
  ON_SCHEDULE: { label: 'On Schedule', color: 'brand' },
  BEHIND_SCHEDULE: { label: 'Behind Schedule', color: 'warning' },
  CRITICAL_DELAY: { label: 'Critical Delay', color: 'danger' },
};

// Subject color theme mapping
const subjectColorMap: Record<string, { bar: string; badge: string; text: string; dot: string }> = {
  Mathematics: {
    bar: '#2563EB', // Blue
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    text: 'text-blue-600',
    dot: '#2563EB',
  },
  Physics: {
    bar: '#8B5CF6', // Purple / Violet
    badge: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    text: 'text-purple-600',
    dot: '#8B5CF6',
  },
  Chemistry: {
    bar: '#EC4899', // Pink / Magenta
    badge: 'bg-pink-50 text-pink-700 ring-1 ring-pink-200',
    text: 'text-pink-600',
    dot: '#EC4899',
  },
  English: {
    bar: '#059669', // Emerald Green
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    text: 'text-emerald-600',
    dot: '#059669',
  },
  Biology: {
    bar: '#06B6D4', // Cyan
    badge: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
    text: 'text-cyan-600',
    dot: '#06B6D4',
  },
  Botany: {
    bar: '#10B981', // Green
    badge: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    text: 'text-green-600',
    dot: '#10B981',
  },
  Zoology: {
    bar: '#F59E0B', // Amber
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    text: 'text-amber-600',
    dot: '#F59E0B',
  },
  Economics: {
    bar: '#F97316', // Orange
    badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    text: 'text-orange-600',
    dot: '#F97316',
  },
  Commerce: {
    bar: '#6366F1', // Indigo
    badge: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    text: 'text-indigo-600',
    dot: '#6366F1',
  },
  Civics: {
    bar: '#64748B', // Slate
    badge: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200',
    text: 'text-slate-600',
    dot: '#64748B',
  },
};

function getSubjectTheme(subjectName: string) {
  const cleanName = (subjectName || '').trim();
  if (subjectColorMap[cleanName]) {
    return subjectColorMap[cleanName];
  }
  // Check case-insensitive
  const found = Object.keys(subjectColorMap).find(
    (k) => k.toLowerCase() === cleanName.toLowerCase()
  );
  if (found) {
    return subjectColorMap[found];
  }

  // Consistent hash-based fallback
  const fallbackList = [
    { bar: '#2563EB', badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200', text: 'text-blue-600', dot: '#2563EB' },
    { bar: '#8B5CF6', badge: 'bg-purple-50 text-purple-700 ring-purple-200', text: 'text-purple-600', dot: '#8B5CF6' },
    { bar: '#EC4899', badge: 'bg-pink-50 text-pink-700 ring-pink-200', text: 'text-pink-600', dot: '#EC4899' },
    { bar: '#059669', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', text: 'text-emerald-600', dot: '#059669' },
    { bar: '#F59E0B', badge: 'bg-amber-50 text-amber-700 ring-amber-200', text: 'text-amber-600', dot: '#F59E0B' },
    { bar: '#06B6D4', badge: 'bg-cyan-50 text-cyan-700 ring-cyan-200', text: 'text-cyan-600', dot: '#06B6D4' },
  ];
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fallbackList[Math.abs(hash) % fallbackList.length];
}

export function SyllabusCoverage() {
  const [view, setView] = useState<'subject' | 'faculty'>('subject');
  const [syllabusList, setSyllabusList] = useState<FacultySyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFacultySyllabus()
      .then((res) => {
        if (mounted && res?.faculty) {
          setSyllabusList(res.faculty);
          setLoading(false);
        } else if (mounted) {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch faculty syllabus:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Unique subjects for the legend
  const uniqueSubjects = Array.from(new Set(syllabusList.map((s) => s.subject_name).filter(Boolean)));

  return (
    <section>
      <SectionHeader
        title="Faculty & Syllabus Coverage"
        subtitle="Planned vs completed syllabus by group, section, subject and faculty"
        icon={<BookOpen className="h-4.5 w-4.5" />}
        action={
          <div className="flex items-center gap-3">
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Loading syllabus data...</span>
              </div>
            )}
            <div className="flex items-center gap-1 rounded-lg bg-ink-100 p-0.5">
              {(['subject', 'faculty'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-md px-3 py-1 text-[11px] font-semibold capitalize transition-colors ${
                    view === v ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  {v} View
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Subject Color Legend Bar */}
      {uniqueSubjects.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-ink-200/80 bg-white p-3 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 mr-1">
            Subject Legend:
          </span>
          {uniqueSubjects.map((sub) => {
            const theme = getSubjectTheme(sub);
            return (
              <div
                key={sub}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${theme.badge}`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-xs"
                  style={{ backgroundColor: theme.bar }}
                />
                <span>{sub}</span>
              </div>
            );
          })}
        </div>
      )}

      {view === 'subject' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {syllabusList.map((row, idx) => {
            const statusKey = row.schedule_status?.toUpperCase() || 'ON_SCHEDULE';
            const sc = statusConfig[statusKey] || { label: row.schedule_status, color: 'brand' };
            const completed = row.completed_percentage || 0;
            const planned = row.planned_percentage || 100;
            const remaining = Math.max(0, planned - completed);
            const theme = getSubjectTheme(row.subject_name);

            return (
              <Card key={`${row.faculty_id}-${row.subject_name}-${idx}`} hover className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: theme.bar }}
                      />
                      <span className="text-sm font-bold text-ink-900 truncate">
                        {row.subject_name}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] font-semibold text-ink-400 truncate">
                      {row.group_name} · {row.faculty_name}
                    </div>
                  </div>
                  <Pill color={sc.color}>{sc.label}</Pill>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink-500">Progress</span>
                    <span className="font-extrabold text-ink-900" style={{ color: theme.bar }}>
                      {completed}%
                    </span>
                  </div>
                  {/* Progress bar using dedicated subject color */}
                  <ProgressBar
                    value={completed}
                    customColor={theme.bar}
                    height="h-2"
                  />
                  <div className="flex items-center justify-between text-[10px] font-medium text-ink-400">
                    <span>Planned: {planned}%</span>
                    <span>Remaining: {remaining}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
          {syllabusList.length === 0 && !loading && (
            <div className="col-span-3 py-8 text-center text-xs text-ink-400">
              No syllabus coverage records found.
            </div>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-ink-100 bg-ink-50/60 px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-ink-900">Faculty-wise Syllabus Summary</span>
            <span className="text-xs font-semibold text-ink-500">{syllabusList.length} Entries</span>
          </div>
          <div className="overflow-x-auto scrollbar-thin max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-ink-100 text-[10px] uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-2.5 font-bold">Faculty Name</th>
                  <th className="px-4 py-2.5 font-bold">Subject</th>
                  <th className="px-4 py-2.5 font-bold">Group</th>
                  <th className="px-4 py-2.5 font-bold">Planned</th>
                  <th className="px-4 py-2.5 font-bold">Completed</th>
                  <th className="px-4 py-2.5 font-bold">Remaining</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {syllabusList.map((f, idx) => {
                  const statusKey = f.schedule_status?.toUpperCase() || 'ON_SCHEDULE';
                  const sc = statusConfig[statusKey] || { label: f.schedule_status, color: 'brand' };
                  const theme = getSubjectTheme(f.subject_name);

                  return (
                    <tr key={`${f.faculty_id}-${idx}`} className="table-row-hover">
                      <td className="px-4 py-2.5 font-semibold text-ink-800">{f.faculty_name}</td>
                      <td className="px-4 py-2.5 font-semibold">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold ${theme.badge}`}>
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.bar }} />
                          {f.subject_name}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-ink-600">{f.group_name}</td>
                      <td className="px-4 py-2.5 text-ink-700">{f.planned_percentage}%</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <ProgressBar
                              value={f.completed_percentage}
                              customColor={theme.bar}
                              height="h-1.5"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-ink-800">
                            {f.completed_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-ink-700">{f.remaining_percentage}%</td>
                      <td className="px-4 py-2.5">
                        <Pill color={sc.color}>{sc.label}</Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}
