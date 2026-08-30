'use client';

import { useEffect, useState } from 'react';
import {
  ChevronRight,
  TrendingUp,
  Users,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { Card, ProgressBar, SectionHeader, TrendIndicator } from '@/components/ui';
import { LineChart, GroupedBars } from '@/components/charts';
import {
  getAttendanceGroups,
  getGroupSections,
  getSectionStudents,
  type AttendanceGroupItem,
  type AttendanceSectionItem,
  type StudentItem,
} from '@/services/api';
import { attendanceTrend7 } from '@/data';

const groupColorList = ['#3471f5', '#22a17f', '#5996ff', '#f5840a', '#8ebcff', '#10b981'];

export function StudentAttendance() {
  const [groups, setGroups] = useState<AttendanceGroupItem[]>([]);
  // Store sections keyed by group_id
  const [sectionsMap, setSectionsMap] = useState<Record<number, AttendanceSectionItem[]>>({});
  // Store students keyed by `${group_id}-${section_id}`
  const [studentsMap, setStudentsMap] = useState<Record<string, StudentItem[]>>({});
  // Loading states
  const [loadingSections, setLoadingSections] = useState<Record<number, boolean>>({});
  const [loadingStudents, setLoadingStudents] = useState<Record<string, boolean>>({});

  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<number | null>(null);
  const [trendRange, setTrendRange] = useState<'today' | '7' | '30'>('7');
  const [loading, setLoading] = useState(true);

  // 1. Fetch initial group attendance
  useEffect(() => {
    let mounted = true;
    getAttendanceGroups()
      .then((res) => {
        if (mounted && res?.groups?.length) {
          setGroups(res.groups);
          // Pre-expand the first group
          const firstGroup = res.groups[0];
          setExpandedGroupId(firstGroup.group_id);
          setLoading(false);
        } else if (mounted) {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch attendance groups:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch sections when a group is expanded
  useEffect(() => {
    if (!expandedGroupId || sectionsMap[expandedGroupId] || loadingSections[expandedGroupId]) return;

    setLoadingSections((prev) => ({ ...prev, [expandedGroupId]: true }));
    getGroupSections(expandedGroupId)
      .then((res) => {
        if (res?.sections) {
          setSectionsMap((prev) => ({ ...prev, [expandedGroupId]: res.sections }));
        }
      })
      .catch((err) => console.error('Failed to fetch group sections:', err))
      .finally(() => {
        setLoadingSections((prev) => ({ ...prev, [expandedGroupId]: false }));
      });
  }, [expandedGroupId, sectionsMap, loadingSections]);

  // 3. Fetch students when a section is expanded
  useEffect(() => {
    if (!expandedGroupId || !expandedSectionId) return;
    const key = `${expandedGroupId}-${expandedSectionId}`;
    if (studentsMap[key] || loadingStudents[key]) return;

    setLoadingStudents((prev) => ({ ...prev, [key]: true }));
    getSectionStudents(expandedSectionId, { group_id: expandedGroupId })
      .then((res) => {
        if (res?.students) {
          setStudentsMap((prev) => ({ ...prev, [key]: res.students }));
        }
      })
      .catch((err) => console.error('Failed to fetch section students:', err))
      .finally(() => {
        setLoadingStudents((prev) => ({ ...prev, [key]: false }));
      });
  }, [expandedGroupId, expandedSectionId, studentsMap, loadingStudents]);

  const totalStudents = groups.reduce((s, g) => s + g.total_students, 0);
  const totalPresent = groups.reduce((s, g) => s + g.present_today, 0);
  const totalAbsent = groups.reduce((s, g) => s + g.absent_today, 0);
  const overallPct = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : '0.0';

  const trendData =
    trendRange === 'today' ? [Number(overallPct)] :
    trendRange === '7' ? attendanceTrend7 :
    Array.from({ length: 30 }, (_, i) => 92 + Math.round(Math.sin(i / 3) * 2 + (i / 30) * 2 * 10) / 10);

  const sectionBars = groups.map((g, idx) => ({
    label: g.group_name,
    value: g.attendance_percentage,
    color: groupColorList[idx % groupColorList.length],
  }));

  const activeGroup = groups.find((g) => g.group_id === expandedGroupId);
  const activeSections = expandedGroupId ? sectionsMap[expandedGroupId] || [] : [];
  const activeSection = activeSections.find((s) => s.section_id === expandedSectionId);
  const activeStudentKey = expandedGroupId && expandedSectionId ? `${expandedGroupId}-${expandedSectionId}` : '';
  const activeStudents = activeStudentKey ? studentsMap[activeStudentKey] || [] : [];
  const activeAbsentStudents = activeStudents.filter((s) => s.attendance_status?.toUpperCase() === 'ABSENT');

  return (
    <section>
      <SectionHeader
        title="Student Attendance Monitoring"
        subtitle="College → Group → Section → Student"
        icon={<Users className="h-4.5 w-4.5" />}
        action={
          loading ? (
            <div className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold mr-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Loading API data...</span>
            </div>
          ) : undefined
        }
      />

      {/* Top metrics + trend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-ink-900">Attendance Trend</span>
            <div className="flex items-center gap-1 rounded-lg bg-ink-100 p-0.5">
              {(['today', '7', '30'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    trendRange === r ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  {r === 'today' ? 'Today' : r === '7' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Present</div>
              <div className="text-xl font-extrabold text-success-600">{totalPresent.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Absent</div>
              <div className="text-xl font-extrabold text-danger-600">{totalAbsent}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Total</div>
              <div className="text-xl font-extrabold text-ink-900">{totalStudents.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Attendance</div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-ink-900">{overallPct}%</span>
                <TrendIndicator trend="up" />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <LineChart data={trendData} height={120} color="#3471f5" yMin={90} yMax={97} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-bold text-ink-900">Group-wise Attendance</span>
          </div>
          <GroupedBars data={sectionBars.length ? sectionBars : [{ label: 'All Groups', value: 94, color: '#3471f5' }]} height={150} max={100} />
          <div className="mt-3 space-y-2">
            {groups.map((g) => (
              <div key={g.group_id} className="flex items-center gap-2">
                <span className="w-16 text-xs font-bold text-ink-700 truncate">{g.group_name}</span>
                <ProgressBar
                  value={g.attendance_percentage}
                  color={g.attendance_percentage >= 95 ? 'success' : g.attendance_percentage >= 90 ? 'brand' : 'warning'}
                />
                <span className="w-12 text-right text-xs font-bold text-ink-700">{g.attendance_percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Drill-down: College → Group → Section → Students */}
      <Card className="mt-4 overflow-hidden shadow-sm">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/70 px-4 py-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-ink-500">DRILL-DOWN</span>
          <span className="text-xs font-medium text-ink-400">College</span>
          {activeGroup && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
              <span className="text-xs font-semibold text-ink-800">{activeGroup.group_name}</span>
            </>
          )}
          {activeSection && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
              <span className="text-xs font-semibold text-brand-600">Section {activeSection.section_name}</span>
            </>
          )}
        </div>

        {/* Group-wise Accordion List */}
        <div className="divide-y divide-ink-100">
          {groups.map((g) => {
            const isGroupOpen = expandedGroupId === g.group_id;
            const sections = sectionsMap[g.group_id] || [];
            const isSectionsLoading = loadingSections[g.group_id];

            return (
              <div key={g.group_id} className="transition-colors">
                {/* 1. Group Header Row */}
                <button
                  type="button"
                  onClick={() => {
                    setExpandedGroupId(isGroupOpen ? null : g.group_id);
                    setExpandedSectionId(null);
                  }}
                  className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors cursor-pointer ${
                    isGroupOpen ? 'bg-brand-50/30 font-semibold' : 'hover:bg-ink-50'
                  }`}
                >
                  <ChevronRight
                    className={`h-4 w-4 text-ink-400 transition-transform duration-200 shrink-0 ${
                      isGroupOpen ? 'rotate-90 text-brand-600' : ''
                    }`}
                  />
                  <span className="w-24 text-sm font-bold text-ink-900 truncate">{g.group_name}</span>

                  <div className="flex flex-1 items-center gap-4 text-xs text-ink-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-ink-400" /> {g.total_students}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-success-600">
                      <UserCheck className="h-3.5 w-3.5" /> {g.present_today}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-danger-600">
                      <UserX className="h-3.5 w-3.5" /> {g.absent_today}
                    </span>
                  </div>

                  <div className="w-48 hidden sm:block">
                    <ProgressBar
                      value={g.attendance_percentage}
                      color={g.attendance_percentage >= 95 ? 'success' : g.attendance_percentage >= 85 ? 'brand' : 'warning'}
                      height="h-2"
                    />
                  </div>

                  <span className="w-14 text-right text-sm font-extrabold text-ink-900">{g.attendance_percentage}%</span>
                  <TrendIndicator trend={g.attendance_percentage >= 90 ? 'up' : 'stable'} />
                </button>

                {/* 2. Group Content (Sections Dropdown) */}
                {isGroupOpen && (
                  <div className="bg-ink-50/50 px-4 py-3 border-t border-ink-100 animate-slide-down">
                    {isSectionsLoading && sections.length === 0 ? (
                      <div className="flex items-center gap-2 py-3 px-3 text-xs text-ink-500">
                        <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                        <span>Loading sections for {g.group_name}...</span>
                      </div>
                    ) : sections.length === 0 ? (
                      <div className="py-3 px-3 text-xs text-ink-400">
                        No sections available for {g.group_name}.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sections.map((s) => {
                          const isSectionOpen = expandedSectionId === s.section_id;
                          const studentKey = `${g.group_id}-${s.section_id}`;
                          const students = studentsMap[studentKey] || [];
                          const isStudentsLoading = loadingStudents[studentKey];

                          return (
                            <div
                              key={s.section_id}
                              className="rounded-xl border border-ink-200/80 bg-white overflow-hidden shadow-2xs"
                            >
                              {/* Section Header Row */}
                              <button
                                type="button"
                                onClick={() => setExpandedSectionId(isSectionOpen ? null : s.section_id)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                                  isSectionOpen ? 'bg-brand-50/40 font-semibold' : 'hover:bg-ink-50'
                                }`}
                              >
                                <ChevronRight
                                  className={`h-3.5 w-3.5 text-ink-400 transition-transform duration-200 shrink-0 ${
                                    isSectionOpen ? 'rotate-90 text-brand-600' : ''
                                  }`}
                                />
                                <span className="w-28 text-xs font-bold text-ink-800">
                                  Section {s.section_name}
                                </span>
                                <span className="text-xs font-medium text-ink-500">
                                  {s.present_today}/{s.total_students} present
                                </span>
                                <div className="flex-1 max-w-md hidden md:block">
                                  <ProgressBar
                                    value={s.attendance_percentage}
                                    height="h-1.5"
                                    color={s.attendance_percentage >= 95 ? 'success' : s.attendance_percentage >= 85 ? 'brand' : 'warning'}
                                  />
                                </div>
                                <span className="w-12 text-right text-xs font-bold text-ink-900">
                                  {s.attendance_percentage}%
                                </span>
                                <TrendIndicator trend={s.attendance_percentage >= 90 ? 'up' : 'stable'} />
                              </button>

                              {/* 3. Section Content (Students List Table) */}
                              {isSectionOpen && (
                                <div className="border-t border-ink-100 bg-white p-4 animate-slide-down">
                                  <div className="mb-3 flex items-center justify-between">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500">
                                      Students List — {g.group_name} · Section {s.section_name}
                                    </span>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className="font-semibold text-success-600">
                                        {students.filter((st) => st.attendance_status.toUpperCase() === 'PRESENT').length} Present
                                      </span>
                                      <span className="font-semibold text-danger-600">
                                        {students.filter((st) => st.attendance_status.toUpperCase() === 'ABSENT').length} Absent
                                      </span>
                                    </div>
                                  </div>

                                  {isStudentsLoading && students.length === 0 ? (
                                    <div className="flex items-center gap-2 py-4 text-xs text-ink-500">
                                      <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                                      <span>Loading students list...</span>
                                    </div>
                                  ) : students.length === 0 ? (
                                    <div className="py-4 text-center text-xs text-ink-400">
                                      No students registered in this section.
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto scrollbar-thin">
                                      <table className="w-full text-left text-xs">
                                        <thead>
                                          <tr className="border-b border-ink-100 text-[10px] uppercase tracking-wide text-ink-400">
                                            <th className="py-2 pr-4 font-bold">ROLL NO.</th>
                                            <th className="py-2 pr-4 font-bold">STUDENT</th>
                                            <th className="py-2 pr-4 font-bold">STATUS</th>
                                            <th className="py-2 font-bold">LEAVE</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-ink-100">
                                          {students.map((st) => {
                                            const statusUpper = st.attendance_status?.toUpperCase() || 'NOT_MARKED';
                                            const isPresent = statusUpper === 'PRESENT';
                                            const isAbsent = statusUpper === 'ABSENT';

                                            return (
                                              <tr key={st.student_id} className="table-row-hover">
                                                <td className="py-2.5 pr-4 font-mono font-medium text-ink-600">
                                                  {st.roll_number || st.student_code}
                                                </td>
                                                <td className="py-2.5 pr-4 font-semibold text-ink-900">
                                                  {st.student_name}
                                                </td>
                                                <td className="py-2.5 pr-4">
                                                  {isPresent ? (
                                                    <span className="chip bg-success-50 text-success-700 font-semibold">
                                                      Present
                                                    </span>
                                                  ) : isAbsent ? (
                                                    <span className="chip bg-danger-50 text-danger-700 font-semibold">
                                                      Absent
                                                    </span>
                                                  ) : (
                                                    <span className="chip bg-ink-100 text-ink-700 font-semibold">
                                                      Not Marked
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="py-2.5 text-ink-500 font-medium">
                                                  {st.leave_type
                                                    ? `${st.leave_type}${st.leave_reason ? ` (${st.leave_reason})` : ''}`
                                                    : '—'}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Full Absent Students Quick Modal/Panel */}
    </section>
  );
}
