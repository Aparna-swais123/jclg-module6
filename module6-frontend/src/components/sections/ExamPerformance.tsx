'use client';

import { useEffect, useState } from 'react';
import {
  Award,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  TrendingDown,
  TrendingUp,
  Trophy,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Card, Pill, ProgressBar, SectionHeader } from '@/components/ui';
import { GroupedBars } from '@/components/charts';
import { getExamPerformance, type ExamPerformanceData } from '@/services/api';

const groupColors: Record<string, string> = {
  MPC: '#3471f5',
  BiPC: '#22a17f',
  MEC: '#5996ff',
  CEC: '#f5840a',
  HEC: '#8ebcff',
};

// Helper for clean short group name
function getShortGroupName(name: string): string {
  const parts = name.split(' ');
  return parts[0] || name;
}

function Metric({ label, value, tone, icon }: { label: string; value: string; tone: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200/70 bg-white p-3">
      <div className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>{icon}</div>
      <div className="text-lg font-extrabold text-ink-900">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">{label}</div>
    </div>
  );
}

export function ExamPerformance() {
  const [data, setData] = useState<ExamPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [viewSubjectsSectionId, setViewSubjectsSectionId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    getExamPerformance()
      .then((res) => {
        if (mounted) {
          setData(res);
          if (res?.groups?.length) {
            // Select first group by default
            setSelectedGroupId(res.groups[0].group_id);
            if (res.groups[0].sections?.length) {
              setViewSubjectsSectionId(res.groups[0].sections[0].section_id);
            }
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch exam performance:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const overall = data?.overall || {
    average_percentage: 0,
    pass_percentage: 0,
    fail_percentage: 0,
    highest_percentage: 0,
    appeared: 0,
    passed: 0,
    failed: 0,
  };

  const groups = data?.groups || [];
  const groupBars = groups.map((g) => ({
    label: getShortGroupName(g.group_name),
    value: g.average_percentage,
    color: groupColors[getShortGroupName(g.group_name)] || '#3471f5',
  }));

  const activeGroup = groups.find((g) => g.group_id === selectedGroupId) || groups[0];
  const activeSections = activeGroup?.sections || [];
  const activeSectionWithSubjects = activeSections.find((s) => s.section_id === viewSubjectsSectionId) || activeSections[0];

  return (
    <section>
      <SectionHeader
        title="Examination Performance"
        subtitle="College → Group → Section → Subject"
        icon={<ClipboardList className="h-4.5 w-4.5" />}
        action={
          <div className="flex items-center gap-3">
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Loading exam data...</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-400">EXAM</span>
              <span className="text-xs font-semibold text-ink-800">{data?.exam?.exam_name || 'Mid Term Exams'}</span>
            </div>
          </div>
        }
      />

      {/* College-level summary KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Metric label="AVERAGE" value={`${overall.average_percentage}%`} tone="bg-brand-50 text-brand-600" icon={<TrendingUp className="h-3.5 w-3.5" />} />
        <Metric label="PASS RATE" value={`${overall.pass_percentage}%`} tone="bg-success-50 text-success-600" icon={<Award className="h-3.5 w-3.5" />} />
        <Metric label="FAIL RATE" value={`${overall.fail_percentage}%`} tone="bg-danger-50 text-danger-600" icon={<TrendingDown className="h-3.5 w-3.5" />} />
        <Metric label="HIGHEST" value={`${overall.highest_percentage}%`} tone="bg-teal-50 text-teal-600" icon={<Trophy className="h-3.5 w-3.5" />} />
        <Metric label="APPEARED" value={overall.appeared.toLocaleString()} tone="bg-ink-100 text-ink-700" icon={<ClipboardList className="h-3.5 w-3.5" />} />
        <Metric label="PASSED" value={overall.passed.toLocaleString()} tone="bg-success-50 text-success-700" icon={<Award className="h-3.5 w-3.5" />} />
        <Metric label="FAILED" value={overall.failed.toLocaleString()} tone="bg-danger-50 text-danger-700" icon={<TrendingDown className="h-3.5 w-3.5" />} />
      </div>

      {/* Middle Row: Group-wise Comparison Chart (Left) + Group-wise Performance Table (Right) */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Group-wise Comparison Chart */}
        <Card className="p-4 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-900">Group-wise Comparison</span>
            </div>
            <GroupedBars
              data={groupBars.length ? groupBars : [{ label: 'All Groups', value: 78, color: '#3471f5' }]}
              height={180}
              max={100}
            />
          </div>
          <div className="pt-3 border-t border-ink-100 flex items-center justify-between text-xs text-ink-400">
            <span>Overall Campus Benchmark</span>
            <span className="font-semibold text-ink-700">{overall.average_percentage}% Avg</span>
          </div>
        </Card>

        {/* Right: Group-wise Performance Table */}
        <Card className="p-4 lg:col-span-8 overflow-hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-ink-900">Group-wise Performance</span>
            <span className="text-xs font-semibold text-ink-400">{groups.length} Groups Enrolled</span>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ink-100 text-[10px] uppercase tracking-wide text-ink-400">
                  <th className="pb-2.5 font-bold">GROUP</th>
                  <th className="pb-2.5 font-bold">AVG %</th>
                  <th className="pb-2.5 font-bold">PASS %</th>
                  <th className="pb-2.5 font-bold">FAIL %</th>
                  <th className="pb-2.5 font-bold text-center">STUDENTS</th>
                  <th className="pb-2.5 font-bold text-center">FAILED</th>
                  <th className="pb-2.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {groups.map((g) => {
                  const isSelected = selectedGroupId === g.group_id;
                  const shortName = getShortGroupName(g.group_name);
                  const avg = g.average_percentage;

                  return (
                    <tr
                      key={g.group_id}
                      onClick={() => {
                        setSelectedGroupId(g.group_id);
                        if (g.sections?.length) {
                          setViewSubjectsSectionId(g.sections[0].section_id);
                        }
                      }}
                      className={`table-row-hover cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 font-bold text-ink-900 flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: groupColors[shortName] || '#3471f5' }}
                        />
                        <span>{shortName}</span>
                      </td>
                      <td className="py-3 font-bold">
                        <span
                          className={
                            avg >= 80 ? 'text-success-600' : avg >= 75 ? 'text-brand-600' : 'text-warning-600'
                          }
                        >
                          {avg}%
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-success-600">{g.pass_percentage}%</td>
                      <td className="py-3 font-semibold text-danger-600">{g.fail_percentage}%</td>
                      <td className="py-3 text-center text-ink-600">{g.total_students}</td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            g.failed > 0
                              ? 'bg-danger-50 text-danger-700 ring-1 ring-danger-200'
                              : 'bg-ink-100 text-ink-600'
                          }`}
                        >
                          {g.failed}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                            isSelected ? 'bg-brand-100 text-brand-700' : 'text-ink-400 hover:text-ink-700'
                          }`}
                        >
                          {isSelected ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Bottom Section: DRILL-DOWN <GROUP NAME> */}
      {activeGroup && (
        <Card className="mt-4 overflow-hidden shadow-sm animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-ink-500">DRILL-DOWN</span>
              <span className="text-xs font-bold text-brand-700">{getShortGroupName(activeGroup.group_name)}</span>
              <span className="text-xs font-medium text-ink-400">({activeGroup.group_name})</span>
            </div>
            <span className="text-xs font-semibold text-ink-500">
              {activeSections.length} Section{activeSections.length !== 1 ? 's' : ''} Available
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Grid of Section Cards */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeSections.map((sec) => {
                const isViewing = viewSubjectsSectionId === sec.section_id;
                const secAvg = sec.average_percentage;

                return (
                  <div
                    key={sec.section_id}
                    className={`rounded-xl border p-4 transition-all duration-200 bg-white shadow-2xs ${
                      isViewing
                        ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm'
                        : 'border-ink-200/80 hover:border-brand-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-ink-900">Section {sec.section_name}</span>
                      <span
                        className={`text-sm font-extrabold ${
                          secAvg >= 80 ? 'text-success-600' : secAvg >= 75 ? 'text-brand-600' : 'text-warning-600'
                        }`}
                      >
                        {secAvg}%
                      </span>
                    </div>

                    <div className="my-3">
                      <ProgressBar
                        value={secAvg}
                        height="h-2"
                        color={secAvg >= 80 ? 'success' : secAvg >= 75 ? 'brand' : 'warning'}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setViewSubjectsSectionId(isViewing ? null : sec.section_id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                      >
                        <span>{isViewing ? 'Hide subjects' : 'View subjects'}</span>
                        <ChevronRight
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isViewing ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      <span className="text-[11px] text-ink-400 font-medium">
                        {sec.passed}/{sec.appeared} passed
                      </span>
                    </div>
                  </div>
                );
              })}

              {activeSections.length === 0 && (
                <div className="col-span-3 py-6 text-center text-xs text-ink-400">
                  No section data available for this group.
                </div>
              )}
            </div>

            {/* Subjects Table for the selected section */}
            {activeSectionWithSubjects && viewSubjectsSectionId === activeSectionWithSubjects.section_id && (
              <div className="mt-4 rounded-xl border border-ink-200/80 bg-ink-50/40 p-4 animate-slide-down">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-brand-600" />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-ink-800">
                      Subject Performance — Section {activeSectionWithSubjects.section_name} ({getShortGroupName(activeGroup.group_name)})
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-ink-500">
                    {activeSectionWithSubjects.subjects?.length || 0} Subjects Recorded
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg bg-white border border-ink-200/70">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-ink-100 text-[10px] uppercase tracking-wide text-ink-400 bg-ink-50/70">
                        <th className="px-4 py-2.5 font-bold">SUBJECT</th>
                        <th className="px-4 py-2.5 font-bold">AVG %</th>
                        <th className="px-4 py-2.5 font-bold">PASS %</th>
                        <th className="px-4 py-2.5 font-bold">FAIL %</th>
                        <th className="px-4 py-2.5 font-bold">HIGHEST %</th>
                        <th className="px-4 py-2.5 font-bold">LOWEST %</th>
                        <th className="px-4 py-2.5 font-bold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {activeSectionWithSubjects.subjects?.map((sub) => {
                        const subAvg = sub.average_percentage;
                        const statusColor = subAvg >= 80 ? 'success' : subAvg >= 75 ? 'brand' : 'warning';
                        const statusLabel = subAvg >= 80 ? 'Ahead' : subAvg >= 75 ? 'On Track' : 'Needs Support';

                        return (
                          <tr key={sub.subject_id} className="table-row-hover">
                            <td className="px-4 py-3 font-bold text-ink-900">{sub.subject_name}</td>
                            <td className="px-4 py-3 font-bold">
                              <span
                                className={
                                  subAvg >= 80
                                    ? 'text-success-600'
                                    : subAvg >= 75
                                    ? 'text-brand-600'
                                    : 'text-warning-600'
                                }
                              >
                                {subAvg}%
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-success-600">{sub.pass_percentage}%</td>
                            <td className="px-4 py-3 font-semibold text-danger-600">{sub.fail_percentage}%</td>
                            <td className="px-4 py-3 font-medium text-ink-700">{sub.highest_percentage}%</td>
                            <td className="px-4 py-3 font-medium text-ink-700">{sub.lowest_percentage}%</td>
                            <td className="px-4 py-3">
                              <Pill color={statusColor}>{statusLabel}</Pill>
                            </td>
                          </tr>
                        );
                      })}

                      {(!activeSectionWithSubjects.subjects || activeSectionWithSubjects.subjects.length === 0) && (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-xs text-ink-400">
                            No subject marks recorded for this section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </section>
  );
}
