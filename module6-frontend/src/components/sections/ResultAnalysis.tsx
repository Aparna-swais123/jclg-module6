'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Card, ProgressBar, SectionHeader } from '@/components/ui';
import { Donut } from '@/components/charts';
import { getExamPerformance, type ExamPerformanceData } from '@/services/api';

const gradeColorMap: Record<string, string> = {
  'A+': '#10B981', // Vibrant Green
  'A': '#059669',  // Deep Emerald Green
  'B+': '#2563EB', // Royal Blue
  'B': '#3B82F6',  // Light/Sky Blue
  'C': '#F59E0B',  // Amber / Yellow
  'D': '#F97316',  // Orange
  'F': '#EF4444',  // Red
  Distinction: '#10B981',
  'First Class': '#059669',
  'Second Class': '#2563EB',
  Pass: '#F59E0B',
  Fail: '#EF4444',
  'Below Pass': '#EF4444',
};

function getGradeColor(grade: string, index: number = 0): string {
  const clean = (grade || '').trim();
  const upper = clean.toUpperCase();
  
  if (upper === 'A+') return '#10B981';
  if (upper === 'A') return '#059669';
  if (upper === 'B+') return '#2563EB';
  if (upper === 'B') return '#3B82F6';
  if (upper === 'C') return '#F59E0B';
  if (upper === 'D') return '#F97316';
  if (upper === 'F') return '#EF4444';
  
  if (gradeColorMap[clean]) return gradeColorMap[clean];

  const palette = ['#10B981', '#059669', '#2563EB', '#3B82F6', '#F59E0B', '#F97316', '#EF4444'];
  return palette[index % palette.length];
}

export function ResultAnalysis() {
  const [data, setData] = useState<ExamPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getExamPerformance()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch result analysis:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const resultSummary = data?.result_summary || {
    passed: 0,
    failed: 0,
    distinction: 0,
    first_class: 0,
    second_class: 0,
    below_pass: 0,
    result_pending: 0,
  };

  const total = data?.overall?.appeared || (resultSummary.passed + resultSummary.failed + (resultSummary.result_pending || 0)) || 0;
  const passRate = total > 0 ? ((resultSummary.passed / total) * 100).toFixed(1) : '0.0';

  const summaryItems = [
    { label: 'Passed', value: resultSummary.passed, color: 'text-success-600', bg: 'bg-success-50', icon: <CheckCircle2 className="h-4 w-4" /> },
    { label: 'Failed', value: resultSummary.failed, color: 'text-danger-600', bg: 'bg-danger-50', icon: <XCircle className="h-4 w-4" /> },
    { label: 'Distinction', value: resultSummary.distinction, color: 'text-teal-600', bg: 'bg-teal-50', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'First Class', value: resultSummary.first_class, color: 'text-brand-600', bg: 'bg-brand-50', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Second Class', value: resultSummary.second_class, color: 'text-ink-600', bg: 'bg-ink-100', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Below Pass', value: resultSummary.below_pass, color: 'text-danger-600', bg: 'bg-danger-50', icon: <AlertTriangle className="h-4 w-4" /> },
    { label: 'Result Pending', value: resultSummary.result_pending, color: 'text-warning-600', bg: 'bg-warning-50', icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  const gradeDist = data?.grade_distribution?.length
    ? data.grade_distribution.map((g, idx) => ({
        label: g.grade,
        value: g.count,
        color: getGradeColor(g.grade, idx),
        percentage: g.percentage,
      }))
    : [
        { label: 'A+', value: 0, color: '#10B981', percentage: 0 },
        { label: 'A', value: 0, color: '#059669', percentage: 0 },
        { label: 'B+', value: 0, color: '#2563EB', percentage: 0 },
        { label: 'B', value: 0, color: '#3B82F6', percentage: 0 },
        { label: 'C', value: 0, color: '#F59E0B', percentage: 0 },
        { label: 'D', value: 0, color: '#F97316', percentage: 0 },
        { label: 'F', value: 0, color: '#EF4444', percentage: 0 },
      ];

  return (
    <section>
      <SectionHeader
        title="Result Analysis"
        subtitle="Grade distribution and examination summary statistics"
        icon={<BarChart3 className="h-4.5 w-4.5" />}
        action={
          loading ? (
            <div className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Loading results...</span>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Summary tiles */}
        <Card className="p-4 lg:col-span-2">
          <span className="text-sm font-bold text-ink-900">Result Summary</span>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summaryItems.map((s) => (
              <div key={s.label} className="rounded-xl border border-ink-200/70 p-3">
                <div className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>{s.icon}</div>
                <div className="text-lg font-extrabold text-ink-900">{s.value.toLocaleString()}</div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-ink-50/60 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-ink-600">Overall Result Rate</span>
              <span className="font-extrabold text-ink-900">{passRate}%</span>
            </div>
            <ProgressBar value={Number(passRate)} color="success" height="h-2.5" />
          </div>
        </Card>

        {/* Grade distribution donut */}
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-sm font-bold text-ink-900">Grade Distribution</span>
          <div className="my-2 flex flex-col items-center">
            <Donut
              data={gradeDist.map((g) => ({ label: g.label, value: g.value, color: g.color }))}
              centerLabel={total.toLocaleString()}
              centerSub="Students"
              size={170}
              thickness={28}
            />
          </div>

          {/* 2-Column Grade Legend */}
          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-ink-100">
            {gradeDist.map((g) => (
              <div key={g.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-xs shrink-0"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="font-bold text-ink-800">{g.label}</span>
                </div>
                <span className="font-semibold text-ink-600">{g.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
