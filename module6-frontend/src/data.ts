import type {
  AbsentStudent,
  ActionItem,
  AIInsight,
  AlertCategory,
  AttPerfBucket,
  FacultyCoverageRow,
  FacultyRow,
  GradeBucket,
  GroupAttendance,
  GroupExamPerf,
  GroupHealth,
  MultiFailStudent,
  ProgressCategory,
  RiskStudent,
  SyllabusRow,
} from '@/types';

// Demo data for the Principal Progress Monitoring command center.
// Values are illustrative UI demonstration data — the underlying schema
// (faculty attendance, syllabus coverage) is a future data-model requirement.

export const alertCategories: AlertCategory[] = [
  { key: 'attendance', label: 'Attendance', count: 8, color: 'brand' },
  { key: 'academic', label: 'Academic', count: 7, color: 'danger' },
  { key: 'trend', label: 'Performance Trend', count: 5, color: 'warning' },
  { key: 'syllabus', label: 'Syllabus', count: 3, color: 'teal' },
];

export const groupAttendance: GroupAttendance[] = [
  {
    group: 'MPC', total: 420, present: 402, absent: 18, pct: 95.7, trend: 'up',
    sections: [
      { section: 'A', total: 140, present: 137, absent: 3, pct: 97.9, trend: 'up' },
      { section: 'B', total: 140, present: 133, absent: 7, pct: 95.0, trend: 'stable' },
      { section: 'C', total: 140, present: 132, absent: 8, pct: 94.3, trend: 'down' },
    ],
  },
  {
    group: 'BiPC', total: 300, present: 282, absent: 18, pct: 94.0, trend: 'stable',
    sections: [
      { section: 'A', total: 150, present: 143, absent: 7, pct: 95.3, trend: 'stable' },
      { section: 'B', total: 150, present: 139, absent: 11, pct: 92.7, trend: 'down' },
    ],
  },
  {
    group: 'MEC', total: 220, present: 205, absent: 15, pct: 93.2, trend: 'stable',
    sections: [
      { section: 'A', total: 110, present: 104, absent: 6, pct: 94.5, trend: 'stable' },
      { section: 'B', total: 110, present: 101, absent: 9, pct: 91.8, trend: 'down' },
    ],
  },
  {
    group: 'CEC', total: 180, present: 162, absent: 18, pct: 90.0, trend: 'down',
    sections: [
      { section: 'A', total: 90, present: 84, absent: 6, pct: 93.3, trend: 'stable' },
      { section: 'B', total: 90, present: 78, absent: 12, pct: 86.7, trend: 'down' },
    ],
  },
  {
    group: 'HEC', total: 128, present: 119, absent: 9, pct: 93.0, trend: 'up',
    sections: [
      { section: 'A', total: 64, present: 61, absent: 3, pct: 95.3, trend: 'up' },
      { section: 'B', total: 64, present: 58, absent: 6, pct: 90.6, trend: 'stable' },
    ],
  },
];

export const absentStudents: AbsentStudent[] = [
  { roll: 'MPC-A-014', name: 'Aarav Sharma', group: 'MPC', section: 'A', leave: 'Medical' },
  { roll: 'MPC-A-022', name: 'Diya Patel', group: 'MPC', section: 'A' },
  { roll: 'MPC-B-007', name: 'Karthik Reddy', group: 'MPC', section: 'B', leave: 'Approved' },
  { roll: 'MPC-B-031', name: 'Sneha Iyer', group: 'MPC', section: 'B' },
  { roll: 'MPC-C-019', name: 'Rahul Verma', group: 'MPC', section: 'C' },
  { roll: 'BiPC-A-011', name: 'Ananya Rao', group: 'BiPC', section: 'A', leave: 'Medical' },
  { roll: 'BiPC-B-004', name: 'Vivaan Gupta', group: 'BiPC', section: 'B' },
  { roll: 'BiPC-B-028', name: 'Ishita Nair', group: 'BiPC', section: 'B' },
  { roll: 'MEC-A-009', name: 'Arjun Mehta', group: 'MEC', section: 'A' },
  { roll: 'MEC-B-016', name: 'Sara Khan', group: 'MEC', section: 'B', leave: 'Approved' },
  { roll: 'CEC-A-012', name: 'Rohan Das', group: 'CEC', section: 'A' },
  { roll: 'CEC-B-003', name: 'Priya Menon', group: 'CEC', section: 'B' },
  { roll: 'CEC-B-021', name: 'Aditya Joshi', group: 'CEC', section: 'B' },
  { roll: 'CEC-B-045', name: 'Meera Krishnan', group: 'CEC', section: 'B', leave: 'Medical' },
  { roll: 'HEC-A-006', name: 'Tanvi Bhat', group: 'HEC', section: 'A' },
  { roll: 'HEC-B-017', name: 'Nikhil Pillai', group: 'HEC', section: 'B' },
];

export const attendanceTrend7 = [93.2, 94.1, 93.8, 95.0, 94.6, 94.2, 94.9];
export const attendanceTrend30 = Array.from({ length: 30 }, (_, i) =>
  92 + Math.round(Math.sin(i / 3) * 2 + (i / 30) * 2 * 10) / 10,
);

export const facultyRows: FacultyRow[] = [
  { name: 'Dr. Lakshmi Prasad', dept: 'Mathematics', scheduled: 6, completed: 4, status: 'present' },
  { name: 'Prof. Ramesh Babu', dept: 'Physics', scheduled: 5, completed: 5, status: 'present' },
  { name: 'Mrs. Sunita Devi', dept: 'Chemistry', scheduled: 6, completed: 3, status: 'present' },
  { name: 'Mr. Anil Kumar', dept: 'Botany', scheduled: 4, completed: 0, status: 'absent' },
  { name: 'Ms. Priya Sarma', dept: 'English', scheduled: 5, completed: 4, status: 'present' },
  { name: 'Dr. K. Venkatesh', dept: 'Economics', scheduled: 4, completed: 0, status: 'leave' },
  { name: 'Mr. Suresh Reddy', dept: 'Civics', scheduled: 3, completed: 3, status: 'present' },
  { name: 'Mrs. Geeta Rao', dept: 'Commerce', scheduled: 5, completed: 2, status: 'present' },
  { name: 'Dr. M. Chandra', dept: 'Mathematics', scheduled: 0, completed: 0, status: 'no-period' },
  { name: 'Mr. Pavan Kalyan', dept: 'Physics', scheduled: 4, completed: 1, status: 'schedule-issue' },
];

export const groupExamPerf: GroupExamPerf[] = [
  {
    group: 'MPC', avg: 82, pass: 96, fail: 4, students: 420, failed: 17,
    sections: [
      { section: 'A', avg: 84, subjects: [
        { subject: 'Mathematics', avgMarks: 78, avgPct: 78, pass: 92, fail: 8, highest: 98, lowest: 41 },
        { subject: 'Physics', avgMarks: 74, avgPct: 74, pass: 88, fail: 12, highest: 95, lowest: 38 },
        { subject: 'Chemistry', avgMarks: 69, avgPct: 69, pass: 81, fail: 19, highest: 92, lowest: 32 },
        { subject: 'English', avgMarks: 81, avgPct: 81, pass: 99, fail: 1, highest: 96, lowest: 52 },
      ]},
      { section: 'B', avg: 78, subjects: [
        { subject: 'Mathematics', avgMarks: 71, avgPct: 71, pass: 85, fail: 15, highest: 94, lowest: 35 },
        { subject: 'Physics', avgMarks: 70, avgPct: 70, pass: 82, fail: 18, highest: 91, lowest: 33 },
        { subject: 'Chemistry', avgMarks: 65, avgPct: 65, pass: 76, fail: 24, highest: 89, lowest: 28 },
        { subject: 'English', avgMarks: 79, avgPct: 79, pass: 97, fail: 3, highest: 95, lowest: 48 },
      ]},
      { section: 'C', avg: 74, subjects: [
        { subject: 'Mathematics', avgMarks: 66, avgPct: 66, pass: 78, fail: 22, highest: 90, lowest: 30 },
        { subject: 'Physics', avgMarks: 64, avgPct: 64, pass: 74, fail: 26, highest: 88, lowest: 29 },
        { subject: 'Chemistry', avgMarks: 60, avgPct: 60, pass: 69, fail: 31, highest: 86, lowest: 24 },
        { subject: 'English', avgMarks: 77, avgPct: 77, pass: 95, fail: 5, highest: 94, lowest: 44 },
      ]},
    ],
  },
  {
    group: 'BiPC', avg: 79, pass: 94, fail: 6, students: 300, failed: 18,
    sections: [
      { section: 'A', avg: 81, subjects: [
        { subject: 'Botany', avgMarks: 73, avgPct: 73, pass: 86, fail: 14, highest: 93, lowest: 40 },
        { subject: 'Zoology', avgMarks: 75, avgPct: 75, pass: 88, fail: 12, highest: 95, lowest: 42 },
        { subject: 'Chemistry', avgMarks: 68, avgPct: 68, pass: 80, fail: 20, highest: 90, lowest: 31 },
        { subject: 'English', avgMarks: 80, avgPct: 80, pass: 98, fail: 2, highest: 95, lowest: 50 },
      ]},
      { section: 'B', avg: 76, subjects: [
        { subject: 'Botany', avgMarks: 69, avgPct: 69, pass: 81, fail: 19, highest: 91, lowest: 34 },
        { subject: 'Zoology', avgMarks: 71, avgPct: 71, pass: 84, fail: 16, highest: 92, lowest: 36 },
        { subject: 'Chemistry', avgMarks: 64, avgPct: 64, pass: 75, fail: 25, highest: 88, lowest: 27 },
        { subject: 'English', avgMarks: 78, avgPct: 78, pass: 96, fail: 4, highest: 94, lowest: 46 },
      ]},
    ],
  },
  {
    group: 'MEC', avg: 77, pass: 92, fail: 8, students: 220, failed: 18,
    sections: [
      { section: 'A', avg: 79, subjects: [
        { subject: 'Economics', avgMarks: 74, avgPct: 74, pass: 86, fail: 14, highest: 93, lowest: 39 },
        { subject: 'Commerce', avgMarks: 76, avgPct: 76, pass: 89, fail: 11, highest: 95, lowest: 44 },
        { subject: 'Accountancy', avgMarks: 72, avgPct: 72, pass: 83, fail: 17, highest: 92, lowest: 35 },
        { subject: 'English', avgMarks: 80, avgPct: 80, pass: 98, fail: 2, highest: 96, lowest: 51 },
      ]},
      { section: 'B', avg: 75, subjects: [
        { subject: 'Economics', avgMarks: 70, avgPct: 70, pass: 81, fail: 19, highest: 90, lowest: 32 },
        { subject: 'Commerce', avgMarks: 72, avgPct: 72, pass: 84, fail: 16, highest: 91, lowest: 34 },
        { subject: 'Accountancy', avgMarks: 68, avgPct: 68, pass: 78, fail: 22, highest: 89, lowest: 30 },
        { subject: 'English', avgMarks: 78, avgPct: 78, pass: 96, fail: 4, highest: 94, lowest: 45 },
      ]},
    ],
  },
  {
    group: 'CEC', avg: 71, pass: 86, fail: 14, students: 180, failed: 25,
    sections: [
      { section: 'A', avg: 74, subjects: [
        { subject: 'Civics', avgMarks: 72, avgPct: 72, pass: 84, fail: 16, highest: 91, lowest: 38 },
        { subject: 'Economics', avgMarks: 70, avgPct: 70, pass: 81, fail: 19, highest: 90, lowest: 33 },
        { subject: 'Commerce', avgMarks: 74, avgPct: 74, pass: 87, fail: 13, highest: 93, lowest: 41 },
        { subject: 'English', avgMarks: 79, avgPct: 79, pass: 97, fail: 3, highest: 95, lowest: 47 },
      ]},
      { section: 'B', avg: 68, subjects: [
        { subject: 'Civics', avgMarks: 64, avgPct: 64, pass: 74, fail: 26, highest: 88, lowest: 28 },
        { subject: 'Economics', avgMarks: 62, avgPct: 62, pass: 71, fail: 29, highest: 86, lowest: 25 },
        { subject: 'Commerce', avgMarks: 68, avgPct: 68, pass: 80, fail: 20, highest: 90, lowest: 32 },
        { subject: 'English', avgMarks: 76, avgPct: 76, pass: 94, fail: 6, highest: 93, lowest: 43 },
      ]},
    ],
  },
  {
    group: 'HEC', avg: 75, pass: 90, fail: 10, students: 128, failed: 13,
    sections: [
      { section: 'A', avg: 77, subjects: [
        { subject: 'History', avgMarks: 74, avgPct: 74, pass: 86, fail: 14, highest: 93, lowest: 40 },
        { subject: 'Economics', avgMarks: 72, avgPct: 72, pass: 84, fail: 16, highest: 91, lowest: 37 },
        { subject: 'Civics', avgMarks: 73, avgPct: 73, pass: 85, fail: 15, highest: 92, lowest: 38 },
        { subject: 'English', avgMarks: 80, avgPct: 80, pass: 98, fail: 2, highest: 96, lowest: 50 },
      ]},
      { section: 'B', avg: 73, subjects: [
        { subject: 'History', avgMarks: 70, avgPct: 70, pass: 82, fail: 18, highest: 90, lowest: 34 },
        { subject: 'Economics', avgMarks: 68, avgPct: 68, pass: 79, fail: 21, highest: 89, lowest: 31 },
        { subject: 'Civics', avgMarks: 69, avgPct: 69, pass: 81, fail: 19, highest: 89, lowest: 32 },
        { subject: 'English', avgMarks: 78, avgPct: 78, pass: 96, fail: 4, highest: 94, lowest: 44 },
      ]},
    ],
  },
];

export const collegeExamSummary = {
  avg: 77,
  pass: 92,
  fail: 8,
  highest: 98,
  lowest: 24,
  appeared: 1248,
  passed: 1148,
  failed: 100,
};

export const gradeBuckets: GradeBucket[] = [
  { grade: 'A+', count: 286, color: '#12b85f' },
  { grade: 'A', count: 342, color: '#22a17f' },
  { grade: 'B+', count: 248, color: '#3471f5' },
  { grade: 'B', count: 164, color: '#5996ff' },
  { grade: 'C', count: 108, color: '#ffa314' },
  { grade: 'D', count: 72, color: '#f5840a' },
  { grade: 'F', count: 28, color: '#e44848' },
];

export const resultSummary = {
  passed: 1148,
  failed: 100,
  distinction: 286,
  firstClass: 342,
  secondClass: 248,
  belowPass: 100,
  pending: 24,
};

export const multiFailStudents: MultiFailStudent[] = [
  { name: 'Rahul Verma', group: 'MPC', section: 'C', failed: ['Chemistry', 'Physics'], overall: 48 },
  { name: 'Priya Menon', group: 'CEC', section: 'B', failed: ['Economics', 'Civics'], overall: 41 },
  { name: 'Aditya Joshi', group: 'CEC', section: 'B', failed: ['Economics', 'Civics', 'English'], overall: 38 },
  { name: 'Sara Khan', group: 'MEC', section: 'B', failed: ['Accountancy'], overall: 52 },
  { name: 'Vivaan Gupta', group: 'BiPC', section: 'B', failed: ['Chemistry'], overall: 55 },
  { name: 'Nikhil Pillai', group: 'HEC', section: 'B', failed: ['Economics', 'Civics'], overall: 44 },
];

export const syllabusRows: SyllabusRow[] = [
  { subject: 'Mathematics', group: 'MPC', planned: 100, completed: 67, pct: 67, faculty: 'Dr. Lakshmi Prasad', status: 'on-schedule' },
  { subject: 'Physics', group: 'MPC', planned: 100, completed: 79, pct: 79, faculty: 'Prof. Ramesh Babu', status: 'ahead' },
  { subject: 'Chemistry', group: 'MPC', planned: 100, completed: 60, pct: 60, faculty: 'Mrs. Sunita Devi', status: 'behind' },
  { subject: 'English', group: 'MPC', planned: 100, completed: 80, pct: 80, faculty: 'Ms. Priya Sarma', status: 'ahead' },
  { subject: 'Botany', group: 'BiPC', planned: 100, completed: 72, pct: 72, faculty: 'Mr. Anil Kumar', status: 'on-schedule' },
  { subject: 'Zoology', group: 'BiPC', planned: 100, completed: 75, pct: 75, faculty: 'Dr. R. Annapurna', status: 'on-schedule' },
  { subject: 'Economics', group: 'MEC', planned: 100, completed: 58, pct: 58, faculty: 'Dr. K. Venkatesh', status: 'critical-delay' },
  { subject: 'Commerce', group: 'MEC', planned: 100, completed: 70, pct: 70, faculty: 'Mrs. Geeta Rao', status: 'on-schedule' },
  { subject: 'Civics', group: 'CEC', planned: 100, completed: 63, pct: 63, faculty: 'Mr. Suresh Reddy', status: 'behind' },
  { subject: 'Economics', group: 'CEC', planned: 100, completed: 55, pct: 55, faculty: 'Dr. K. Venkatesh', status: 'critical-delay' },
  { subject: 'History', group: 'HEC', planned: 100, completed: 74, pct: 74, faculty: 'Dr. N. Subbarao', status: 'on-schedule' },
  { subject: 'Civics', group: 'HEC', planned: 100, completed: 69, pct: 69, faculty: 'Mr. Suresh Reddy', status: 'on-schedule' },
];

export const facultyCoverage: FacultyCoverageRow[] = [
  { faculty: 'Dr. Lakshmi Prasad', subject: 'Mathematics', section: 'A', expected: 70, actual: 74, status: 'ahead' },
  { faculty: 'Dr. Lakshmi Prasad', subject: 'Mathematics', section: 'B', expected: 70, actual: 68, status: 'behind' },
  { faculty: 'Mrs. Sunita Devi', subject: 'Chemistry', section: 'A', expected: 70, actual: 62, status: 'behind' },
  { faculty: 'Mrs. Sunita Devi', subject: 'Chemistry', section: 'C', expected: 70, actual: 58, status: 'critical-delay' },
  { faculty: 'Dr. K. Venkatesh', subject: 'Economics', section: 'A', expected: 70, actual: 60, status: 'behind' },
  { faculty: 'Dr. K. Venkatesh', subject: 'Economics', section: 'B', expected: 70, actual: 52, status: 'critical-delay' },
  { faculty: 'Prof. Ramesh Babu', subject: 'Physics', section: 'A', expected: 70, actual: 80, status: 'ahead' },
  { faculty: 'Ms. Priya Sarma', subject: 'English', section: 'B', expected: 70, actual: 82, status: 'ahead' },
];

export const progressCategories: ProgressCategory[] = [
  { key: 'improving', label: 'Improving', pct: 73, count: 911, trend: 'up' },
  { key: 'stable', label: 'Stable', pct: 21, count: 262, trend: 'stable' },
  { key: 'declining', label: 'Declining', pct: 4, count: 50, trend: 'down' },
  { key: 'needs-support', label: 'Needs Support', pct: 6, count: 75, trend: 'down' },
];

export const progressTrendData = [
  { exam: 'Unit Test 1', improving: 62, stable: 28, declining: 6, needsSupport: 4 },
  { exam: 'Unit Test 2', improving: 66, stable: 25, declining: 5, needsSupport: 4 },
  { exam: 'Mid-Term', improving: 70, stable: 22, declining: 4, needsSupport: 4 },
  { exam: 'Pre-Final', improving: 73, stable: 21, declining: 4, needsSupport: 6 },
];

export const attPerfBuckets: AttPerfBucket[] = [
  { band: 'High (≥90%)', avgAttendance: 94, avgResult: 82, students: 842 },
  { band: 'Medium (75–89%)', avgAttendance: 82, avgResult: 74, students: 318 },
  { band: 'Low (<75%)', avgAttendance: 68, avgResult: 61, students: 88 },
];

export const groupHealth: GroupHealth[] = [
  { group: 'MPC', status: 'healthy', attendance: 95.7, examAvg: 82, failed: 17, syllabus: 72, trend: 'up', note: 'Top attendance and exam average across all groups.' },
  { group: 'BiPC', status: 'healthy', attendance: 94.0, examAvg: 79, failed: 18, syllabus: 74, trend: 'stable', note: 'Consistent performance; Chemistry dragging slightly.' },
  { group: 'MEC', status: 'stable', attendance: 93.2, examAvg: 77, failed: 18, syllabus: 64, trend: 'stable', note: 'Economics syllabus behind schedule.' },
  { group: 'CEC', status: 'attention', attendance: 90.0, examAvg: 71, failed: 25, syllabus: 59, trend: 'down', note: 'Section B failure rate and Economics coverage need review.' },
  { group: 'HEC', status: 'stable', attendance: 93.0, examAvg: 75, failed: 13, syllabus: 72, trend: 'up', note: 'Improving trend; attendance recovering.' },
];

export const riskStudents: RiskStudent[] = [
  { name: 'Aditya Joshi', group: 'CEC', section: 'B', risk: 'high', reason: 'Failed multiple subjects', lastResult: 38, attendance: 71 },
  { name: 'Priya Menon', group: 'CEC', section: 'B', risk: 'high', reason: 'Attendance + low marks', lastResult: 41, attendance: 74 },
  { name: 'Nikhil Pillai', group: 'HEC', section: 'B', risk: 'high', reason: 'Failed multiple subjects', lastResult: 44, attendance: 79 },
  { name: 'Rahul Verma', group: 'MPC', section: 'C', risk: 'high', reason: 'Consistent declining trend', lastResult: 48, attendance: 81 },
  { name: 'Sara Khan', group: 'MEC', section: 'B', risk: 'attention', reason: 'Low subject performance', lastResult: 52, attendance: 84 },
  { name: 'Vivaan Gupta', group: 'BiPC', section: 'B', risk: 'attention', reason: 'Marks declining', lastResult: 55, attendance: 77 },
  { name: 'Meera Krishnan', group: 'CEC', section: 'B', risk: 'attention', reason: 'Attendance below threshold', lastResult: 58, attendance: 73 },
  { name: 'Ishita Nair', group: 'BiPC', section: 'B', risk: 'attention', reason: 'Attendance + low marks', lastResult: 54, attendance: 76 },
  { name: 'Karthik Reddy', group: 'MPC', section: 'B', risk: 'improving', reason: 'Attendance recovering', lastResult: 63, attendance: 88 },
  { name: 'Tanvi Bhat', group: 'HEC', section: 'A', risk: 'improving', reason: 'Marks improving', lastResult: 67, attendance: 91 },
];

export const aiInsights: AIInsight[] = [
  { id: 'ai-1', severity: 'critical', title: 'CEC Section B has the lowest average examination performance', detail: 'Section B averages 68% — 6 points below the group and 9 below the college average, driven by Economics and Civics.', scope: 'CEC · Section B', date: '2026-08-26' },
  { id: 'ai-2', severity: 'critical', title: 'Chemistry syllabus coverage is significantly behind schedule', detail: 'MPC Chemistry is at 60% coverage vs 70% expected; Section C is critical at 58%.', scope: 'MPC · Chemistry', date: '2026-08-26' },
  { id: 'ai-3', severity: 'warning', title: 'Low-attendance students also show declining marks', detail: '8 students with attendance below 75% are simultaneously in the declining-performance band.', scope: 'College-wide', date: '2026-08-25' },
  { id: 'ai-4', severity: 'positive', title: 'MPC Section A has the highest attendance this month', detail: 'Section A reached 97.9% attendance, up 1.2 points from last month.', scope: 'MPC · Section A', date: '2026-08-25' },
  { id: 'ai-5', severity: 'warning', title: 'Intervention recommended for combined-risk group', detail: 'A cluster of 12 students shows both attendance and academic risk; early intervention is advised.', scope: 'CEC, HEC', date: '2026-08-24' },
  { id: 'ai-6', severity: 'informational', title: 'English results remain strong across all groups', detail: 'English pass percentage is above 94% in every group with no critical sections.', scope: 'College-wide', date: '2026-08-24' },
];

export const actionItems: ActionItem[] = [
  { id: 'a-1', severity: 'critical', title: '12 students have attendance below the defined threshold', scope: 'CEC, HEC, MPC', detail: 'Review and initiate parent communication / counselling.' },
  { id: 'a-2', severity: 'critical', title: 'CEC Section B has a high failure rate', scope: 'CEC · Section B', detail: '25 students failed; Economics and Civics need remedial sessions.' },
  { id: 'a-3', severity: 'critical', title: 'Chemistry syllabus coverage is significantly behind schedule', scope: 'MPC · Chemistry', detail: 'Section C at 58% — reassign or add support periods.' },
  { id: 'a-4', severity: 'warning', title: '3 sections have below-target attendance', scope: 'CEC-B, MEC-C, MEC-B', detail: 'Below 93% college target for the week.' },
  { id: 'a-5', severity: 'warning', title: '4 students show declining performance', scope: 'MPC-C, BiPC-B', detail: 'Trend over last two examinations is downward.' },
  { id: 'a-6', severity: 'warning', title: 'Faculty coverage issues require review', scope: 'Botany, Physics', detail: '1 absent + 1 schedule issue; arrange substitute periods.' },
  { id: 'a-7', severity: 'informational', title: 'Examination results are pending for some sections', scope: 'HEC · Section B', detail: '24 answer scripts awaiting evaluation.' },
];
