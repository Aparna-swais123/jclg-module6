// Central API service for Module 6 Progress Monitoring & Academic Tracking

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const DEFAULT_CAMPUS_ID = 1;
export const DEFAULT_ACADEMIC_YEAR_ID = 4;
export const DEFAULT_TARGET_DATE = '2026-08-20';
export const DEFAULT_EXAM_ID = 8;

export interface ProgressOverviewData {
  date: string;
  academic_year_id: number;
  campus_id: number;
  students: {
    total_students: number;
    present_today: number;
    absent_today: number;
    not_marked_today: number;
    attendance_percentage: number;
  };
  faculty: {
    total_faculty: number;
    present: number | null;
    absent: number | null;
    on_leave: number | null;
    attendance_percentage: number | null;
    attendance_tracking_available: boolean;
  };
  academic: {
    exams_today: number;
    results_pending: number;
    students_needing_attention: number;
    active_alerts: number;
  };
}

export interface AttendanceGroupItem {
  group_id: number;
  group_name: string;
  total_students: number;
  present_today: number;
  absent_today: number;
  not_marked_today: number;
  attendance_percentage: number;
}

export interface AttendanceSectionItem {
  section_id: number;
  section_name: string;
  total_students: number;
  present_today: number;
  absent_today: number;
  not_marked_today: number;
  attendance_percentage: number;
}

export interface StudentItem {
  student_id: number;
  student_code: string;
  roll_number: string;
  student_name: string;
  attendance_status: string;
  leave_type: string | null;
  leave_status: string | null;
  leave_reason: string | null;
}

export interface FacultyMonitoringItem {
  faculty_id: number;
  faculty_name: string;
  department: string;
  total_periods: number;
  completed_periods: number;
  progress_percentage: number;
  attendance_status: string;
}

export interface FacultySyllabusItem {
  faculty_id: number;
  faculty_name: string;
  subject_name: string;
  group_name: string;
  planned_percentage: number;
  completed_percentage: number;
  remaining_percentage: number;
  schedule_status: 'AHEAD_OF_SCHEDULE' | 'ON_SCHEDULE' | 'BEHIND_SCHEDULE' | string;
}

export interface ExamPerformanceData {
  date: string;
  academic_year_id: number;
  campus_id: number;
  exam: {
    exam_id: number;
    exam_name: string;
    exam_type: string;
  } | null;
  overall: {
    average_percentage: number;
    pass_percentage: number;
    fail_percentage: number;
    highest_percentage: number;
    appeared: number;
    passed: number;
    failed: number;
  };
  groups: Array<{
    group_id: number;
    group_name: string;
    total_students: number;
    appeared: number;
    passed: number;
    failed: number;
    pass_percentage: number;
    fail_percentage: number;
    average_percentage: number;
    sections?: Array<{
      section_id: number;
      section_name: string;
      total_students: number;
      appeared: number;
      passed: number;
      failed: number;
      pass_percentage: number;
      fail_percentage: number;
      average_percentage: number;
      subjects?: Array<{
        subject_id: number;
        subject_name: string;
        max_marks: number;
        pass_marks: number;
        total_students: number;
        passed: number;
        failed: number;
        pass_percentage: number;
        fail_percentage: number;
        average_percentage: number;
        highest_percentage: number;
        lowest_percentage: number;
      }>;
    }>;
  }>;
  result_summary: {
    passed: number;
    failed: number;
    distinction: number;
    first_class: number;
    second_class: number;
    below_pass: number;
    result_pending: number;
  };
  grade_distribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
}

export interface ProgressAnalyticsData {
  academic_year_id: number;
  campus_id: number;
  student_progress_trends: {
    summary: Array<{
      trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'NEEDS_SUPPORT' | string;
      students: number;
      percentage: number;
    }>;
    exams: Array<{
      exam_id: number;
      exam_name: string;
      exam_type: string;
    }>;
  };
  attendance_vs_performance: {
    scatter: Array<{
      attendance_percentage: number;
      result_percentage: number;
    }>;
    bands: Array<{
      band: string;
      students: number;
      average_attendance: number;
      average_result: number;
    }>;
  };
  academic_health_by_group: Array<{
    group_id: number;
    group_name: string;
    total_students: number;
    attendance_percentage: number;
    exam_average: number;
    syllabus_percentage: number;
    failed_students: number;
    health_status: 'HEALTHY' | 'STABLE' | 'NEEDS_ATTENTION' | string;
  }>;
}

// Helper fetcher
async function apiFetch<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      query.append(key, String(val));
    }
  });

  const url = `${API_BASE}${endpoint}${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText} at ${endpoint}`);
  }
  return res.json();
}

// API functions with robust parameter merging
export async function getProgressOverview(params?: {
  campus_id?: number;
  academic_year_id?: number;
  target_date?: string;
}): Promise<ProgressOverviewData> {
  return apiFetch<ProgressOverviewData>('/api/v1/progress/overview', {
    campus_id: params?.campus_id ?? DEFAULT_CAMPUS_ID,
    academic_year_id: params?.academic_year_id ?? DEFAULT_ACADEMIC_YEAR_ID,
    target_date: params?.target_date ?? DEFAULT_TARGET_DATE,
  });
}

export async function getAttendanceGroups(params?: {
  campus_id?: number;
  academic_year_id?: number;
  target_date?: string;
}): Promise<{ groups: AttendanceGroupItem[] }> {
  return apiFetch<{ groups: AttendanceGroupItem[] }>('/api/v1/attendance/groups', {
    campus_id: params?.campus_id ?? DEFAULT_CAMPUS_ID,
    academic_year_id: params?.academic_year_id ?? DEFAULT_ACADEMIC_YEAR_ID,
    target_date: params?.target_date ?? DEFAULT_TARGET_DATE,
  });
}

export async function getGroupSections(groupId: number, params?: {
  campus_id?: number;
  academic_year_id?: number;
  target_date?: string;
}): Promise<{ sections: AttendanceSectionItem[] }> {
  return apiFetch<{ sections: AttendanceSectionItem[] }>(`/api/v1/attendance/groups/${groupId}/sections`, {
    campus_id: params?.campus_id ?? DEFAULT_CAMPUS_ID,
    academic_year_id: params?.academic_year_id ?? DEFAULT_ACADEMIC_YEAR_ID,
    target_date: params?.target_date ?? DEFAULT_TARGET_DATE,
  });
}

export async function getSectionStudents(sectionId: number, params?: {
  campus_id?: number;
  academic_year_id?: number;
  group_id?: number;
  target_date?: string;
}): Promise<{ students: StudentItem[] }> {
  return apiFetch<{ students: StudentItem[] }>(`/api/v1/attendance/sections/${sectionId}/students`, {
    campus_id: params?.campus_id ?? DEFAULT_CAMPUS_ID,
    academic_year_id: params?.academic_year_id ?? DEFAULT_ACADEMIC_YEAR_ID,
    target_date: params?.target_date ?? DEFAULT_TARGET_DATE,
    group_id: params?.group_id,
  });
}

export async function getFacultyMonitoring(params?: {
  campus_id?: number;
  academic_year_id?: number;
  target_date?: string;
}): Promise<{ faculty: FacultyMonitoringItem[] }> {
  return apiFetch<{ faculty: FacultyMonitoringItem[] }>('/faculty-monitoring', {
    campus_id: params?.campus_id ?? DEFAULT_CAMPUS_ID,
    academic_year_id: params?.academic_year_id ?? DEFAULT_ACADEMIC_YEAR_ID,
    target_date: params?.target_date ?? DEFAULT_TARGET_DATE,
  });
}

export async function getFacultySyllabus(params?: {
  campus_id?: number;
  academic_year_id?: number;
}): Promise<{ faculty: FacultySyllabusItem[] }> {
  return apiFetch<{ faculty: FacultySyllabusItem[] }>('/faculty-syllabus', {
    campus_id: params?.campus_id ?? DEFAULT_CAMPUS_ID,
    academic_year_id: params?.academic_year_id ?? DEFAULT_ACADEMIC_YEAR_ID,
  });
}

export async function getExamPerformance(params?: {
  campus_id?: number;
  academic_year_id?: number;
  exam_id?: number;
}): Promise<ExamPerformanceData> {
  return apiFetch<ExamPerformanceData>('/exam-performance', {
    campus_id: params?.campus_id ?? DEFAULT_CAMPUS_ID,
    academic_year_id: params?.academic_year_id ?? DEFAULT_ACADEMIC_YEAR_ID,
    exam_id: params?.exam_id ?? DEFAULT_EXAM_ID,
  });
}

export interface PrincipalProfileData {
  date: string;
  principal: {
    user_id: number;
    campus_id: number | null;
    first_name: string;
    last_name: string | null;
    full_name: string;
    email: string;
    phone: string | null;
    gender: string | null;
    profile_photo: string | null;
    role_id: number;
    role_code: string;
    role_name: string;
  } | null;
  message?: string;
}

export const DEFAULT_USER_ID = 4;

export async function getProgressAnalytics(params?: {
  campus_id?: number;
  academic_year_id?: number;
}): Promise<ProgressAnalyticsData> {
  return apiFetch<ProgressAnalyticsData>('/progress-analytics', {
    campus_id: params?.campus_id ?? DEFAULT_CAMPUS_ID,
    academic_year_id: params?.academic_year_id ?? DEFAULT_ACADEMIC_YEAR_ID,
  });
}

export async function getPrincipalProfile(userId: number = DEFAULT_USER_ID): Promise<PrincipalProfileData> {
  return apiFetch<PrincipalProfileData>('/principal/profile', { user_id: userId });
}
