'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  UserCheck,
  Users,
  Loader2,
} from 'lucide-react';
import { Card, SectionHeader, TrendIndicator } from '@/components/ui';
import { Sparkline } from '@/components/charts';
import { getProgressOverview, type ProgressOverviewData } from '@/services/api';

function KpiTile({
  icon,
  label,
  value,
  sub,
  trend,
  tone,
  spark,
  sparkColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'stable' | 'down';
  tone: 'brand' | 'teal' | 'success' | 'warning' | 'danger';
  spark?: number[];
  sparkColor?: string;
}) {
  const toneMap = {
    brand: 'bg-brand-50 text-brand-600 ring-brand-100',
    teal: 'bg-teal-50 text-teal-600 ring-teal-100',
    success: 'bg-success-50 text-success-600 ring-success-100',
    warning: 'bg-warning-50 text-warning-600 ring-warning-100',
    danger: 'bg-danger-50 text-danger-600 ring-danger-100',
  };
  return (
    <Card hover className="p-4">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${toneMap[tone]}`}>
          {icon}
        </div>
        {trend && <TrendIndicator trend={trend} />}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-extrabold tracking-tight text-ink-900">{value}</div>
        <div className="text-xs font-semibold text-ink-500">{label}</div>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        {sub && <span className="text-[11px] font-medium text-ink-400">{sub}</span>}
        {spark && <div className="w-20"><Sparkline data={spark} color={sparkColor ?? '#3471f5'} /></div>}
      </div>
    </Card>
  );
}

export function CollegeOverview() {
  const [data, setData] = useState<ProgressOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getProgressOverview()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load overview data from API:', err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalStudents = data?.students.total_students ?? 0;
  const presentToday = data?.students.present_today ?? 0;
  const absentToday = data?.students.absent_today ?? 0;
  const attendancePct = data?.students.attendance_percentage ?? 0.0;

  const totalFaculty = data?.faculty.total_faculty ?? 0;
  const facultyPresent = data?.faculty.present ?? 0;
  const facultyAbsent = data?.faculty.absent ?? 0;
  const facultyOnLeave = data?.faculty.on_leave ?? 0;
  const facultyAttendancePct = data?.faculty.attendance_percentage ?? 0.0;

  const examsToday = data?.academic.exams_today ?? 0;
  const resultsPending = data?.academic.results_pending ?? 0;
  const studentsNeedingAttention = data?.academic.students_needing_attention ?? 0;
  const activeAlerts = data?.academic.active_alerts ?? 0;

  return (
    <section>
      <SectionHeader
        title="Today's College Overview"
        subtitle={`Institutional snapshot for ${data?.date ?? 'Today'}`}
        icon={<TrendingUp className="h-4.5 w-4.5" />}
        action={
          loading ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Loading live data...</span>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Students */}
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-ink-900">Students</span>
            <span className="ml-auto text-[11px] font-semibold text-success-600">Live API</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <KpiTile
              icon={<Users className="h-4 w-4" />}
              label="Total Students"
              value={totalStudents.toLocaleString()}
              tone="brand"
              spark={[1240, 1242, 1245, 1244, 1246, 1247, totalStudents]}
            />
            <KpiTile
              icon={<UserCheck className="h-4 w-4" />}
              label="Present Today"
              value={presentToday.toLocaleString()}
              tone="success"
              trend="up"
              spark={[1160, 1172, 1168, 1178, 1180, 1179, presentToday]}
              sparkColor="#12b85f"
            />
            <KpiTile
              icon={<UserCheck className="h-4 w-4 rotate-180" />}
              label="Absent Today"
              value={String(absentToday)}
              tone="danger"
              trend={absentToday > 50 ? 'down' : 'up'}
              spark={[80, 68, 72, 62, 60, 61, absentToday]}
              sparkColor="#e44848"
            />
            <KpiTile
              icon={<GraduationCap className="h-4 w-4" />}
              label="Attendance %"
              value={`${attendancePct}%`}
              tone="success"
              trend="up"
              spark={[93.2, 94.1, 93.8, 95.0, 94.6, 94.2, attendancePct]}
              sparkColor="#12b85f"
            />
          </div>
        </Card>

        {/* Faculty */}
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <ClipboardList className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-ink-900">Faculty</span>
            <span className="ml-auto text-[11px] font-semibold text-ink-500">{facultyPresent} present</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <KpiTile
              icon={<Users className="h-4 w-4" />}
              label="Total Faculty"
              value={String(totalFaculty)}
              tone="teal"
            />
            <KpiTile
              icon={<UserCheck className="h-4 w-4" />}
              label="Present"
              value={facultyPresent !== null ? String(facultyPresent) : '—'}
              tone="success"
              trend="up"
            />
            <KpiTile
              icon={<UserCheck className="h-4 w-4 rotate-180" />}
              label="Absent"
              value={facultyAbsent !== null ? String(facultyAbsent) : '—'}
              tone="danger"
            />
            <KpiTile
              icon={<CalendarCheck className="h-4 w-4" />}
              label="On Leave"
              value={facultyOnLeave !== null ? String(facultyOnLeave) : '—'}
              tone="warning"
            />
            <div className="col-span-2 flex items-center justify-between rounded-xl bg-teal-50/60 px-3 py-2.5">
              <span className="text-xs font-semibold text-teal-800">Faculty Attendance</span>
              <span className="text-lg font-extrabold text-teal-700">
                {facultyAttendancePct !== null ? `${facultyAttendancePct}%` : 'N/A'}
              </span>
            </div>
          </div>
        </Card>

        {/* Academic */}
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <BookOpenCheck className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-ink-900">Academic</span>
            <span className="ml-auto text-[11px] font-semibold text-warning-600">
              {resultsPending} results pending
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <KpiTile
              icon={<ClipboardList className="h-4 w-4" />}
              label="Exams Today"
              value={String(examsToday)}
              tone="brand"
            />
            <KpiTile
              icon={<ClipboardList className="h-4 w-4" />}
              label="Results Pending"
              value={String(resultsPending)}
              tone="warning"
            />
            <KpiTile
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Students Needing Attention"
              value={String(studentsNeedingAttention)}
              tone="danger"
              trend="down"
            />
            <KpiTile
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Active Alerts"
              value={String(activeAlerts)}
              tone="danger"
              trend="up"
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
