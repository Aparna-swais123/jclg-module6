'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarX,
  ClipboardList,
  Clock,
  UserCheck,
  UserX,
  Users,
  Loader2,
} from 'lucide-react';
import { Card, Pill, ProgressBar, SectionHeader } from '@/components/ui';
import { getFacultyMonitoring, type FacultyMonitoringItem } from '@/services/api';

const statusConfig: Record<string, { label: string; color: 'success' | 'danger' | 'warning' | 'ink' | 'brand' }> = {
  PRESENT: { label: 'Present', color: 'success' },
  ABSENT: { label: 'Absent', color: 'danger' },
  ON_LEAVE: { label: 'On Leave', color: 'warning' },
  NOT_MARKED: { label: 'Not Marked', color: 'ink' },
};

export function FacultyMonitoring() {
  const [facultyList, setFacultyList] = useState<FacultyMonitoringItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFacultyMonitoring()
      .then((res) => {
        if (mounted && res?.faculty) {
          setFacultyList(res.faculty);
          setLoading(false);
        } else if (mounted) {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch faculty monitoring data:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const present = facultyList.filter((f) => f.attendance_status.toUpperCase() === 'PRESENT').length;
  const absent = facultyList.filter((f) => f.attendance_status.toUpperCase() === 'ABSENT').length;
  const onLeave = facultyList.filter((f) => f.attendance_status.toUpperCase() === 'ON_LEAVE').length;
  const notMarked = facultyList.filter((f) => f.attendance_status.toUpperCase() === 'NOT_MARKED').length;
  const total = facultyList.length || 86;
  const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '90.7';

  return (
    <section>
      <SectionHeader
        title="Faculty Monitoring"
        subtitle="Scheduled teaching periods and faculty status for today"
        icon={<ClipboardList className="h-4.5 w-4.5" />}
        action={
          loading ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Loading faculty data...</span>
            </div>
          ) : undefined
        }
      />

      {/* Status tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          { icon: <Users className="h-4 w-4" />, label: 'Total Faculty', value: String(total), color: 'bg-ink-100 text-ink-700' },
          { icon: <UserCheck className="h-4 w-4" />, label: 'Present', value: String(present), color: 'bg-success-50 text-success-700' },
          { icon: <UserX className="h-4 w-4" />, label: 'Absent', value: String(absent), color: 'bg-danger-50 text-danger-700' },
          { icon: <CalendarX className="h-4 w-4" />, label: 'On Leave', value: String(onLeave), color: 'bg-warning-50 text-warning-700' },
          { icon: <Clock className="h-4 w-4" />, label: 'Not Marked', value: String(notMarked), color: 'bg-ink-100 text-ink-600' },
          { icon: <AlertCircle className="h-4 w-4" />, label: 'Live Active', value: String(facultyList.filter(f => f.completed_periods > 0).length), color: 'bg-brand-50 text-brand-700' },
        ].map((t) => (
          <Card key={t.label} hover className="p-3.5">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${t.color}`}>{t.icon}</div>
            <div className="text-xl font-extrabold text-ink-900">{t.value}</div>
            <div className="text-[11px] font-semibold text-ink-500">{t.label}</div>
          </Card>
        ))}
      </div>

      {/* Attendance bar + note */}
      <Card className="mt-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3 md:w-72">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-ink-900">{pct}%</div>
              <div className="text-xs font-semibold text-ink-500">Faculty Attendance</div>
            </div>
          </div>
          <div className="flex-1">
            <ProgressBar value={Number(pct)} color="teal" height="h-3" />
          </div>
        </div>
      </Card>

      {/* Faculty table */}
      <Card className="mt-4 overflow-hidden">
        <div className="border-b border-ink-100 bg-ink-50/60 px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm font-bold text-ink-900">Faculty Status — Today</span>
          <span className="text-xs font-semibold text-ink-500">{facultyList.length} Teachers registered</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-ink-100 text-[10px] uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2.5 font-bold">Faculty Name</th>
                <th className="px-4 py-2.5 font-bold">Department</th>
                <th className="px-4 py-2.5 font-bold">Today's Periods</th>
                <th className="px-4 py-2.5 font-bold">Completed</th>
                <th className="px-4 py-2.5 font-bold">Progress</th>
                <th className="px-4 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {facultyList.map((f) => {
                const statusKey = f.attendance_status?.toUpperCase() || 'NOT_MARKED';
                const sc = statusConfig[statusKey] || { label: f.attendance_status, color: 'ink' };
                const prog = f.progress_percentage ?? (f.total_periods > 0 ? (f.completed_periods / f.total_periods) * 100 : 0);

                return (
                  <tr key={f.faculty_id} className="table-row-hover">
                    <td className="px-4 py-2.5 font-semibold text-ink-800">{f.faculty_name}</td>
                    <td className="px-4 py-2.5 text-ink-600">{f.department || 'Academic'}</td>
                    <td className="px-4 py-2.5 text-ink-700">{f.total_periods}</td>
                    <td className="px-4 py-2.5 text-ink-700">{f.completed_periods}</td>
                    <td className="px-4 py-2.5">
                      {f.total_periods > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <ProgressBar
                              value={prog}
                              height="h-1.5"
                              color={prog >= 75 ? 'success' : prog >= 50 ? 'brand' : 'warning'}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-ink-500">{Math.round(prog)}%</span>
                        </div>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Pill color={sc.color}>{sc.label}</Pill>
                    </td>
                  </tr>
                );
              })}
              {facultyList.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                    No faculty monitoring records found for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
