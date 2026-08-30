// ── Shared domain types for the Principal Progress Monitoring module ──

export type GroupCode = 'MPC' | 'BiPC' | 'MEC' | 'CEC' | 'HEC';
export type SectionCode = string; // e.g. "A", "B", "C"
export type Status = 'healthy' | 'stable' | 'attention' | 'critical';
export type Trend = 'up' | 'stable' | 'down';
export type InsightSeverity = 'positive' | 'informational' | 'warning' | 'critical';

export interface GroupAttendance {
  group: GroupCode;
  total: number;
  present: number;
  absent: number;
  pct: number;
  trend: Trend;
  sections: SectionAttendance[];
}

export interface SectionAttendance {
  section: SectionCode;
  total: number;
  present: number;
  absent: number;
  pct: number;
  trend: Trend;
}

export interface AbsentStudent {
  roll: string;
  name: string;
  group: GroupCode;
  section: SectionCode;
  leave?: string;
}

export interface FacultyRow {
  name: string;
  dept: string;
  scheduled: number;
  completed: number;
  status: 'present' | 'absent' | 'leave' | 'no-period' | 'schedule-issue';
}

export interface GroupExamPerf {
  group: GroupCode;
  avg: number;
  pass: number;
  fail: number;
  students: number;
  failed: number;
  sections: SectionExamPerf[];
}

export interface SectionExamPerf {
  section: SectionCode;
  avg: number;
  subjects: SubjectExamPerf[];
}

export interface SubjectExamPerf {
  subject: string;
  avgMarks: number;
  avgPct: number;
  pass: number;
  fail: number;
  highest: number;
  lowest: number;
}

export interface GradeBucket {
  grade: string;
  count: number;
  color: string;
}

export interface MultiFailStudent {
  name: string;
  group: GroupCode;
  section: SectionCode;
  failed: string[];
  overall: number;
}

export interface SyllabusRow {
  subject: string;
  group: GroupCode;
  planned: number;
  completed: number;
  pct: number;
  faculty: string;
  status: 'ahead' | 'on-schedule' | 'behind' | 'critical-delay';
}

export interface FacultyCoverageRow {
  faculty: string;
  subject: string;
  section: SectionCode;
  expected: number;
  actual: number;
  status: 'ahead' | 'on-schedule' | 'behind' | 'critical-delay';
}

export interface ProgressCategory {
  key: 'improving' | 'stable' | 'declining' | 'needs-support';
  label: string;
  pct: number;
  count: number;
  trend: Trend;
}

export interface AttPerfBucket {
  band: string;
  avgAttendance: number;
  avgResult: number;
  students: number;
}

export interface GroupHealth {
  group: GroupCode;
  status: Status;
  attendance: number;
  examAvg: number;
  failed: number;
  syllabus: number;
  trend: Trend;
  note: string;
}

export interface RiskStudent {
  name: string;
  group: GroupCode;
  section: SectionCode;
  risk: 'high' | 'attention' | 'improving';
  reason: string;
  lastResult: number;
  attendance: number;
}

export interface AIInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
  scope: string;
  date: string;
}

export interface ActionItem {
  id: string;
  severity: InsightSeverity;
  title: string;
  scope: string;
  detail: string;
}

export interface AlertCategory {
  key: string;
  label: string;
  count: number;
  color: string;
}
