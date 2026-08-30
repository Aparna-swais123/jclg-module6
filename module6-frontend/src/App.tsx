'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/Header';
import { CollegeOverview } from '@/components/sections/CollegeOverview';
import { StudentAttendance } from '@/components/sections/StudentAttendance';
import { FacultyMonitoring } from '@/components/sections/FacultyMonitoring';
import { ExamPerformance } from '@/components/sections/ExamPerformance';
import { ResultAnalysis } from '@/components/sections/ResultAnalysis';
import { SyllabusCoverage } from '@/components/sections/SyllabusCoverage';
import { ProgressTrends } from '@/components/sections/ProgressTrends';
import { AttendanceVsPerformance } from '@/components/sections/AttendanceVsPerformance';
import { GroupHealthOverview } from '@/components/sections/GroupHealth';
import { EarlyWarning } from '@/components/sections/EarlyWarning';
import { AIInsights } from '@/components/sections/AIInsights';
import { PrincipalAction } from '@/components/sections/PrincipalAction';
import { alertCategories } from '@/data';
import { CalendarCheck, Users, GraduationCap, Bell } from 'lucide-react';
import { getProgressOverview, type ProgressOverviewData } from '@/services/api';

function App() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [overviewData, setOverviewData] = useState<ProgressOverviewData | null>(null);

  useEffect(() => {
    let mounted = true;
    getProgressOverview()
      .then((data) => {
        if (mounted) setOverviewData(data);
      })
      .catch((err) => console.error('Failed to load top metric overview:', err));
    return () => {
      mounted = false;
    };
  }, []);

  const totalAlerts = overviewData?.academic.active_alerts ?? 0;
  const attendancePct = overviewData?.students.attendance_percentage ?? 0;
  const facultyCoverage = overviewData?.faculty.attendance_percentage ?? 0;
  const pendingResults = overviewData?.academic.results_pending ?? 0;

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-ink-900 flex">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />

      {/* 2. Main Layout Container */}
      <div className="flex flex-1 flex-col pl-64 min-w-0">
        {/* Top Header */}
        <TopHeader
          collegeName="Demo Junior College"
          subtitle="Principal Dashboard"
          alertCount={totalAlerts}
        />

        {/* Main Content Body */}
        <main className="mx-auto w-full max-w-[1440px] space-y-6 px-8 py-6">
          {/* 1. Overview View */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
                  Module 6 · Overview
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
                  Progress Monitoring & Academic Tracking
                </h2>
                <p className="text-xs font-medium text-ink-500">
                  Institutional snapshot of college attendance, academic health, faculty coverage, and early-warning alerts.
                </p>
              </div>

              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-card border-l-4 border-l-brand-600 transition-all hover:shadow-cardHover">
                  <div className="flex items-center gap-2.5 text-brand-600">
                    <CalendarCheck className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Attendance</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-ink-900">{attendancePct}%</div>
                  <div className="mt-0.5 text-[11px] font-medium text-success-600">Live student rate</div>
                </div>

                <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-card border-l-4 border-l-brand-600 transition-all hover:shadow-cardHover">
                  <div className="flex items-center gap-2.5 text-brand-600">
                    <Users className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Faculty</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-ink-900">
                    {facultyCoverage !== null ? `${facultyCoverage}%` : '88.5%'}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-ink-500">
                    {overviewData?.faculty.present ?? 78} / {overviewData?.faculty.total_faculty ?? 86} on duty
                  </div>
                </div>

                <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-card border-l-4 border-l-brand-600 transition-all hover:shadow-cardHover">
                  <div className="flex items-center gap-2.5 text-brand-600">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Exams Today</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-ink-900">{overviewData?.academic.exams_today ?? 2}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-brand-600">{pendingResults} pending evaluations</div>
                </div>

                <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-card border-l-4 border-l-brand-600 transition-all hover:shadow-cardHover">
                  <div className="flex items-center gap-2.5 text-brand-600">
                    <Bell className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Active Alerts</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-ink-900">{totalAlerts}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-danger-600">
                    {overviewData?.academic.students_needing_attention ?? 75} needing attention
                  </div>
                </div>
              </div>

              {/* Today's College Overview */}
              <CollegeOverview />
            </div>
          )}

          {/* 2. Student Monitoring Section */}
          {activeSection === 'student-monitoring' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
                  Student Monitoring
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
                  Student Attendance & Absentee Tracking
                </h2>
                <p className="text-xs font-medium text-ink-500">
                  Detailed attendance trends, group-wise breakdowns, multi-level section drill-downs, and absent student registries.
                </p>
              </div>

              <StudentAttendance />
            </div>
          )}

          {/* 3. Faculty Monitoring Section */}
          {activeSection === 'faculty-monitoring' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
                  Faculty Monitoring
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
                  Faculty Activity & Syllabus Coverage
                </h2>
                <p className="text-xs font-medium text-ink-500">
                  Live period completion, teacher attendance status, and subject-wise syllabus progress.
                </p>
              </div>

              <FacultyMonitoring />
              <SyllabusCoverage />
            </div>
          )}

          {/* 4. Academic Performance Section */}
          {activeSection === 'academic-performance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
                  Academic Performance
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
                  Examinations, Marks & Progress Analytics
                </h2>
                <p className="text-xs font-medium text-ink-500">
                  Exam performance metrics, marks distribution, student progress trajectories, and attendance vs performance correlation.
                </p>
              </div>

              <ExamPerformance />
              <ResultAnalysis />
              <ProgressTrends />
              <AttendanceVsPerformance />
            </div>
          )}

          {/* 5. Group Health Section */}
          {activeSection === 'health' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
                  Group Health
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
                  Group-wise Academic Health & Risk Indicators
                </h2>
                <p className="text-xs font-medium text-ink-500">
                  Consolidated health indicators combining attendance, exam averages, syllabus completion, and failure risks.
                </p>
              </div>

              <GroupHealthOverview />
            </div>
          )}

          {/* 6. Notifications & Alerts Section */}
          {activeSection === 'alerts' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
                  Alerts & Notifications
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
                  Early-Warning Alerts & AI Anomaly Detection
                </h2>
                <p className="text-xs font-medium text-ink-500">
                  Automated critical thresholds, at-risk student lists, and prioritized institutional alerts.
                </p>
              </div>

              <EarlyWarning />
            </div>
          )}

          {/* 7. AI Analysis Section */}
          {activeSection === 'ai-insights' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
                  AI Analysis
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
                  AI-Powered Insights & Strategic Recommendations
                </h2>
                <p className="text-xs font-medium text-ink-500">
                  Predictive intervention recommendations, faculty workload optimization, and academic trajectory forecasting.
                </p>
              </div>

              <AIInsights />
            </div>
          )}

          {/* 8. Principal Action Section */}
          {activeSection === 'principal-actions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
                  Principal Actions
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
                  Directives, Action Plans & Administrative Tracking
                </h2>
                <p className="text-xs font-medium text-ink-500">
                  Parent-teacher meetings, remedial assignment scheduling, faculty directives, and institutional actions.
                </p>
              </div>

              <PrincipalAction />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
