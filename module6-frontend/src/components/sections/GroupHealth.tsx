'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, HeartPulse, Loader2 } from 'lucide-react';
import { Card, ProgressBar, SectionHeader, StatusBadge, TrendIndicator } from '@/components/ui';
import { getProgressAnalytics, type ProgressAnalyticsData } from '@/services/api';

const statusMap: Record<string, 'healthy' | 'warning' | 'critical'> = {
  HEALTHY: 'healthy',
  STABLE: 'healthy',
  NEEDS_ATTENTION: 'warning',
  CRITICAL: 'critical',
};

export function GroupHealthOverview() {
  const [data, setData] = useState<ProgressAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedGroupName, setExpandedGroupName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getProgressAnalytics()
      .then((res) => {
        if (mounted && res?.academic_health_by_group?.length) {
          setData(res);
          setExpandedGroupName(res.academic_health_by_group[0].group_name);
          setLoading(false);
        } else if (mounted) {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch group health analytics:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const healthList = data?.academic_health_by_group || [];

  return (
    <section>
      <SectionHeader
        title="Academic Health by Group"
        subtitle="Composite status across attendance, exams, failures, syllabus and trends"
        icon={<HeartPulse className="h-4.5 w-4.5" />}
        action={
          loading ? (
            <div className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Loading health scores...</span>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {healthList.map((g) => {
          const status = statusMap[g.health_status.toUpperCase()] || 'healthy';
          return (
            <Card key={g.group_id} hover className="p-4">
              <div className="flex items-start justify-between">
                <span className="text-lg font-extrabold text-ink-900">{g.group_name}</span>
                <StatusBadge status={status} />
              </div>
              <div className="mt-3 space-y-2">
                {[
                  {
                    label: 'Attendance',
                    value: g.attendance_percentage,
                    max: 100,
                    color: g.attendance_percentage >= 95 ? 'success' : g.attendance_percentage >= 90 ? 'brand' : 'warning',
                  },
                  {
                    label: 'Exam Avg',
                    value: g.exam_average,
                    max: 100,
                    color: g.exam_average >= 78 ? 'success' : g.exam_average >= 72 ? 'brand' : 'warning',
                  },
                  {
                    label: 'Syllabus',
                    value: g.syllabus_percentage,
                    max: 100,
                    color: g.syllabus_percentage >= 70 ? 'success' : g.syllabus_percentage >= 60 ? 'brand' : 'warning',
                  },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="mb-0.5 flex items-center justify-between text-[10px] font-semibold text-ink-500">
                      <span>{m.label}</span>
                      <span className="text-ink-700">{m.value}%</span>
                    </div>
                    <ProgressBar value={m.value} color={m.color as 'success' | 'brand' | 'warning'} height="h-1.5" />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                  {g.failed_students} failed
                </span>
                <TrendIndicator trend="stable" />
              </div>
              <button
                onClick={() => setExpandedGroupName(expandedGroupName === g.group_name ? null : g.group_name)}
                className="mt-2 flex w-full items-center justify-between rounded-lg bg-ink-50 px-2.5 py-1.5 text-[11px] font-semibold text-ink-600 transition-colors hover:bg-ink-100"
              >
                {expandedGroupName === g.group_name ? 'Hide details' : 'View details'}
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${expandedGroupName === g.group_name ? 'rotate-90' : ''}`}
                />
              </button>
            </Card>
          );
        })}
      </div>

      {/* Detail panel */}
      {expandedGroupName && (() => {
        const g = healthList.find((x) => x.group_name === expandedGroupName);
        if (!g) return null;
        return (
          <Card className="mt-3 p-4 animate-slide-down">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink-900">{g.group_name} Health Breakdown</span>
              <span className="text-xs text-ink-400">·</span>
              <span className="text-xs font-semibold text-ink-500">{g.total_students} Enrolled Students</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-ink-50 p-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Attendance</div>
                <div className="text-base font-extrabold text-ink-900">{g.attendance_percentage}%</div>
              </div>
              <div className="rounded-lg bg-ink-50 p-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Exam Average</div>
                <div className="text-base font-extrabold text-ink-900">{g.exam_average}%</div>
              </div>
              <div className="rounded-lg bg-ink-50 p-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Syllabus Covered</div>
                <div className="text-base font-extrabold text-ink-900">{g.syllabus_percentage}%</div>
              </div>
              <div className="rounded-lg bg-danger-50/60 p-2.5 text-danger-700">
                <div className="text-[10px] font-bold uppercase tracking-wide text-danger-500">Failed Students</div>
                <div className="text-base font-extrabold text-danger-700">{g.failed_students}</div>
              </div>
            </div>
          </Card>
        );
      })()}
    </section>
  );
}
