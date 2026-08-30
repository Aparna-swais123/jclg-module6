'use client';

import { useEffect, useState } from 'react';
import { BarChart3, GitCompareArrows, Loader2 } from 'lucide-react';
import { Card, ProgressBar, SectionHeader } from '@/components/ui';
import { ScatterPlot } from '@/components/charts';
import { getProgressAnalytics, type ProgressAnalyticsData } from '@/services/api';

const bandStyles = {
  HIGH: {
    key: 'HIGH',
    label: 'High Attendance (≥90%)',
    barColor: '#10B981', // Emerald / Green
    textTone: 'text-emerald-700',
    dot: '#10B981',
    description: '≥ 90% attendance',
  },
  MEDIUM: {
    key: 'MEDIUM',
    label: 'Moderate Attendance (75–89%)',
    barColor: '#2563EB', // Royal Blue
    textTone: 'text-blue-700',
    dot: '#2563EB',
    description: '75% to 89% attendance',
  },
  LOW: {
    key: 'LOW',
    label: 'Low Attendance (<75%)',
    barColor: '#EF4444', // Red
    textTone: 'text-red-700',
    dot: '#EF4444',
    description: '< 75% attendance',
  },
};

const ORDERED_BANDS = ['HIGH', 'MEDIUM', 'LOW'] as const;

export function AttendanceVsPerformance() {
  const [data, setData] = useState<ProgressAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getProgressAnalytics()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch attendance vs performance data:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const rawScatter = data?.attendance_vs_performance?.scatter || [];
  const rawBands = data?.attendance_vs_performance?.bands || [];

  // Map scatter points with color matching their attendance band
  const scatterData = rawScatter.map((s: any) => {
    const att = Number(s.attendance_percentage || 0);
    const res = Number(s.result_percentage || 0);
    const color = att >= 90 ? '#10B981' : att >= 75 ? '#2563EB' : '#EF4444';
    const studentInfo = s.student_name ? `${s.student_name} (${s.roll_number || ''}): ` : '';

    return {
      x: att,
      y: res,
      size: 1.5,
      label: `${studentInfo}${att}% Att / ${res}% Marks`,
      color,
    };
  });

  // Guarantee all 3 bands (High, Moderate, Low) are always rendered with their distinct colors
  const bands = ORDERED_BANDS.map((key) => {
    const found = rawBands.find((b) => b.band?.toUpperCase() === key);
    const style = bandStyles[key];

    return {
      key,
      label: style.label,
      students: found ? found.students : 0,
      avgAttendance: found ? found.average_attendance : 0,
      avgResult: found ? found.average_result : 0,
      barColor: style.barColor,
      textTone: style.textTone,
      dot: style.dot,
    };
  });

  return (
    <section>
      <SectionHeader
        title="Attendance vs Performance"
        subtitle="Identifying whether low attendance correlates with weaker results"
        icon={<GitCompareArrows className="h-4.5 w-4.5" />}
        action={
          loading ? (
            <div className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Loading correlation...</span>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Scatter Plot */}
        <Card className="p-4 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-bold text-ink-900">Attendance vs Result Correlation</span>
              </div>
              <span className="text-xs font-semibold text-ink-400">{scatterData.length} Students Plotted</span>
            </div>

            <div className="pt-2">
              <ScatterPlot data={scatterData} height={260} />
            </div>
          </div>

          {/* Color Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 pt-3 border-t border-ink-100">
            {bands.map((b) => (
              <div key={b.key} className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: b.dot }}
                />
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 3 Attendance Bands with Distinct Dedicated Colors */}
        <Card className="p-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-900">Average Result by Attendance Band</span>
              <span className="text-xs font-semibold text-ink-400">3 Thresholds</span>
            </div>

            <div className="space-y-4">
              {bands.map((b) => (
                <div key={b.key} className="rounded-xl border border-ink-200/70 p-3 bg-white">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: b.dot }}
                      />
                      <span className="font-bold text-ink-800">{b.label}</span>
                    </div>
                    <span className="font-semibold text-ink-500">{b.students} students</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar
                        value={b.avgResult}
                        customColor={b.barColor}
                        height="h-2.5"
                      />
                    </div>
                    <span
                      className="w-14 text-right text-sm font-extrabold"
                      style={{ color: b.students > 0 ? b.barColor : '#64748b' }}
                    >
                      {b.avgResult}%
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-ink-400">
                    <span>Avg attendance: {b.avgAttendance}%</span>
                    <span>Avg result: {b.avgResult}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-danger-50/60 px-3.5 py-2.5 text-xs font-medium text-danger-700 ring-1 ring-danger-100">
            Low-attendance students show a measurable drop in examination scores compared to regular attendees.
          </div>
        </Card>
      </div>
    </section>
  );
}
