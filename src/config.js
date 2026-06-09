export const BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.6:5000';
export const TEAM_OFFICE_BASE_URL = '/api/etimeoffice';
export const TEAM_OFFICE_AUTH_TOKEN = 'c3VwcG9ydDpzdXBwb3J0OnN1cHBvcnRAMTp0cnVl';

export const cleanId = (id) => {
  if (!id) return '';
  let s = String(id).trim();

  // Handle comma-separated IDs (take the first one)
  if (s.includes(',')) {
    s = s.split(',')[0].trim();
  }

  // Handle triple repetition bug (e.g. 202516202516202516)
  if (s.length >= 9 && s.length % 3 === 0) {
    const partLen = s.length / 3;
    const p1 = s.substring(0, partLen);
    const p2 = s.substring(partLen, partLen * 2);
    const p3 = s.substring(partLen * 2);
    if (p1 === p2 && p1 === p3) return p1;
  }

  // Handle double repetition bug (e.g. 202512202512)
  if (s.length >= 6 && s.length % 2 === 0) {
    const partLen = s.length / 2;
    const p1 = s.substring(0, partLen);
    const p2 = s.substring(partLen);
    if (p1 === p2) return p1;
  }

  return s;
};

export const API_ENDPOINTS = {
  // =========================================================================
  // 1. AUTHENTICATION & PROFILE
  // =========================================================================
  LOGIN: `${BASE_URL}/api/login`,
  REGISTER: `${BASE_URL}/api/register`,
  PROFILE: (email) => email ? `${BASE_URL}/api/profile/${email}` : `${BASE_URL}/api/profile`,
  UPDATE_PROFILE: `${BASE_URL}/api/profile/update`,
  PROFILE_UPDATE: `${BASE_URL}/api/profile/update`,
  UPDATE_ABOUT: `${BASE_URL}/api/profile/about`,
  PROFILE_ABOUT: `${BASE_URL}/api/profile/about`,
  UPDATE_PASSWORD: `${BASE_URL}/api/profile/update-password`,
  PASSWORD_CHANGE: `${BASE_URL}/api/password/change-password`,
  CHANGE_PASSWORD: `${BASE_URL}/api/password/change-password`,
  PASSWORD_RESET: `${BASE_URL}/api/password/reset-with-otp`,
  RESET_PASSWORD_OTP: `${BASE_URL}/api/password/reset-with-otp`,
  REQUEST_OTP: `${BASE_URL}/api/password/request-otp`,
  MANAGER: (email) => email ? `${BASE_URL}/api/profile/manager?email=${email}` : `${BASE_URL}/api/profile/manager`,
  PROFILE_MANAGER: `${BASE_URL}/api/profile/manager`,
  MANAGER_PROFILE: `${BASE_URL}/api/profile/manager`,

  USERS: `${BASE_URL}/api/users`,
  USER_SEARCH: (q) => `${BASE_URL}/api/users/search?q=${q}`,
  STATUS: `${BASE_URL}/api/status`,
  ALERTS: `${BASE_URL}/api/notifications`,
  NOTIFICATIONS: `${BASE_URL}/api/notifications`,
  NOTIFICATIONS_BY_USER: (uid) => `${BASE_URL}/api/notifications/${cleanId(uid)}`,

  // Uploads
  PROFILE_UPLOAD_DOC: `${BASE_URL}/api/profile/upload-doc`,
  PROFILE_UPLOAD_DOCUMENT: `${BASE_URL}/api/profile/upload-document`,
  PROFILE_UPLOAD_DIRECT: `${BASE_URL}/api/profile/upload-direct`,
  PROFILE_UPLOAD_IMAGE: `${BASE_URL}/api/profile/upload-image`,
  UPLOAD_IMAGE: `${BASE_URL}/api/profile/upload-image`,

  // =========================================================================
  // 2. EMPLOYEE & HR MANAGEMENT
  // =========================================================================
  EMPLOYEE_PROFILE: (id) => `${BASE_URL}/api/employee-profile/${cleanId(id)}`,
  EMPLOYEE_PROFILE_GET: (id) => `${BASE_URL}/api/employee-profile/${cleanId(id)}`,
  MY_EMPLOYEE_PROFILE: `${BASE_URL}/api/employee-profile/my`,
  UPDATE_EMPLOYEE_PROFILE: `${BASE_URL}/api/employee-profile/update`,
  EMPLOYEE_PROFILE_UPDATE: `${BASE_URL}/api/employee-profile/update`,
  EMPLOYEE_PROFILE_ALL: `${BASE_URL}/api/admin/employee-profiles`,
  EMPLOYEE_PROFILE_DELETE: (id) => `${BASE_URL}/api/employee-profile/${cleanId(id)}`,
  EMPLOYEE_PROFILE_PUT: (id) => `${BASE_URL}/api/employee-profile/${cleanId(id)}`,

  EMPLOYEES: `${BASE_URL}/api/employees`,
  NEW_JOINEE: `${BASE_URL}/api/new-joinee`,
  NEW_JOINEES: `${BASE_URL}/api/new-joinees`,
  NEW_JOINEES_GET: `${BASE_URL}/api/new-joinees`,
  NEW_JOINEE_UPDATE: (id) => `${BASE_URL}/api/new-joinees/${cleanId(id)}`,
  NEWJOINEE_COURSES: `${BASE_URL}/api/newjoinee-courses`,
  UNBLOCK_ALL_JOINEES: `${BASE_URL}/api/admin/new-joinees/unblock-all`,
  UNBLOCK_ALL_JOINEES_ALT: `${BASE_URL}/api/new-joinees/unblock-all`,
  NEW_JOINEE_UNBLOCK: (id) => `${BASE_URL}/api/new-joinees/${cleanId(id)}/unblock`,
  NEW_JOINEE_UNBLOCK_ADMIN: (id) => `${BASE_URL}/api/admin/new-joinees/${cleanId(id)}/unblock`,
  INTERNS: `${BASE_URL}/api/interns`,
  INTERN_UPDATE: (id) => `${BASE_URL}/api/interns/${cleanId(id)}`,
  INTERN_PROMOTE: (id) => `${BASE_URL}/api/interns/promote/${cleanId(id)}`,
  INTERN_DELETE: (id) => `${BASE_URL}/api/interns/${cleanId(id)}`,

  JOB_APPLICATIONS: `${BASE_URL}/api/job-applications`,
  JOB_APPLICATION_UPDATE: (id) => `${BASE_URL}/api/job-applications/${cleanId(id)}`,
  JOB_POSTINGS: `${BASE_URL}/api/job-postings`,
  JOB_POSTING_PUT: (id) => `${BASE_URL}/api/job-postings/${cleanId(id)}`,
  JOB_POSTING_DELETE: (id) => `${BASE_URL}/api/job-postings/${cleanId(id)}`,

  // =========================================================================
  // 3. LEAVES & ATTENDANCE
  // =========================================================================
  LEAVES_GET: `${BASE_URL}/api/leaves/all`,
  ALL_LEAVES: `${BASE_URL}/api/leaves`,
  ALL_LEAVES_COMPREHENSIVE: `${BASE_URL}/api/leaves/comprehensive`,
  CEO_LEAVES_GET: `${BASE_URL}/api/ceo/leaves`,
  MY_LEAVES_GET: (userId) => `${BASE_URL}/api/leaves/my?userId=${cleanId(userId)}`,
  LEAVE_BALANCE: (userId) => `${BASE_URL}/api/leaves/balance/${cleanId(userId)}`,
  LEAVE_REQUEST: `${BASE_URL}/api/leaves/request`,
  UPDATE_LEAVE_STATUS: (id) => `${BASE_URL}/api/leaves/${cleanId(id)}/status`,
  LEAVE_STATUS_UPDATE: (id) => `${BASE_URL}/api/leaves/${cleanId(id)}/status`,
  LEAVE_STATS_MY: (month) => `${BASE_URL}/api/leaves/stats/my${month ? `?month=${month}` : ''}`,
  ADMIN_LEAVE_STATS: `${BASE_URL}/api/admin/leaves/stats`,
  ADMIN_LEAVE_STATS_UPDATE: `${BASE_URL}/api/admin/leaves/stats`,

  ATTENDANCE: `${BASE_URL}/api/attendance`,
  ATTENDANCE_LOGS: (userId) => `${BASE_URL}/api/attendance_logs?userId=${cleanId(userId)}`,
  ATTENDANCE_LOGS_GET: `${BASE_URL}/api/attendance_logs`,
  ALL_ATTENDANCE: `${BASE_URL}/api/attendance_logs`,
  ATTENDANCE_PUNCH: `${BASE_URL}/api/attendance_logs/punch`,
  ATTENDANCE_PUNCH_UPDATE: `${BASE_URL}/api/attendance/update-punch-time`,
  ATTENDANCE_GAPS: (userId) => `${BASE_URL}/api/attendance/gaps/${cleanId(userId)}`,
  ORGANIZATIONAL_ATTENDANCE: `${BASE_URL}/api/manager/attendance`,
  ATTENDANCE_LOGS_BY_USER: (userId) => `${BASE_URL}/api/attendance_logs?userId=${userId}`,

  HOLIDAYS: `${BASE_URL}/api/holidays`,
  BIRTHDAYS: `${BASE_URL}/api/birthdays`,

  // =========================================================================
  // 4. TASKS & PROJECTS
  // =========================================================================
  TASKS: `${BASE_URL}/api/tasks`,
  TASK_UPDATES: `${BASE_URL}/api/task-updates`,
  TASK_UPDATES_USER: (userId) => `${BASE_URL}/api/task-updates?userId=${cleanId(userId)}`,
  ASSIGN_TASK: `${BASE_URL}/api/master-task`,
  ASSIGNED_TASKS_GET: `${BASE_URL}/api/tasks/all-assigned`,
  ALL_ASSIGNED_TASKS: `${BASE_URL}/api/tasks/all-assigned`,
  TASKS_ASSIGNED: (userId) => `${BASE_URL}/api/tasks/assigned/${cleanId(userId)}`,
  UPDATE_TASK_STATUS: (taskId) => `${BASE_URL}/api/tasks/status/${cleanId(taskId)}`,
  VERIFY_TASK: (taskId) => `${BASE_URL}/api/tasks/review/${cleanId(taskId)}`,
  TASK_REVIEW: (id) => `${BASE_URL}/api/master-task/review/${cleanId(id)}`,
  TASKS_REVIEW: (id) => `${BASE_URL}/api/master-task/review/${cleanId(id)}`,
  SINGLE_TASK_REVIEW: (id) => `${BASE_URL}/api/master-task/review/${cleanId(id)}`,
  SINGLE_TASK_DETAIL: (id) => `${BASE_URL}/api/master-task/${cleanId(id)}`,
  TASKS_BY_MANAGER: (managerId) => `${BASE_URL}/api/tasks/manager/${cleanId(managerId)}`,
  TASKS_BY_TEAM: (teamName) => `${BASE_URL}/api/tasks/team/${teamName}`,
  TEAM_REPORTS: (managerId) => `${BASE_URL}/api/task-updates`,
  MASTER_TASKS_GET: `${BASE_URL}/api/tasks/all-assigned`,

  TEAMS: `${BASE_URL}/api/teams`,
  TEAM: (id) => `${BASE_URL}/api/subordinates/${cleanId(id)}`,
  SUBORDINATES: (userId) => `${BASE_URL}/api/subordinates/${userId}`,
  PROJECTS: `${BASE_URL}/api/projects`,
  PROJECT_SPRINTS: `${BASE_URL}/api/project-sprints`,
  TIMELINE: (managerId) => `${BASE_URL}/api/timeline?managerId=${cleanId(managerId)}`,

  // =========================================================================
  // 5. ASSETS & CERTIFICATES
  // =========================================================================
  ASSETS: `${BASE_URL}/api/assets`,
  MY_ASSETS: (id) => `${BASE_URL}/api/my-assets?employee_id=${cleanId(id)}`,
  ASSET_UPDATE: (id) => `${BASE_URL}/api/assets/${cleanId(id)}`,
  SERVICE_CERTIFICATES: (id) => `${BASE_URL}/api/service-certificates${id ? `/${cleanId(id)}` : ''}`,
  SERVICE_CERTIFICATES_ADMIN: `${BASE_URL}/api/service_certificate_requests`,
  SERVICE_CERTIFICATES_MY: `${BASE_URL}/api/service-certificates/my`,
  SERVICE_CERTIFICATE_MY: `${BASE_URL}/api/service_certificate_requests/my`,
  SERVICE_CERTIFICATES_USER: (id) => `${BASE_URL}/api/service-certificates?userId=${cleanId(id)}`,
  SERVICE_CERTIFICATE_SINGLE: (id) => `${BASE_URL}/api/service_certificate_requests/${cleanId(id)}`,
  SERVICE_CERTIFICATE_REQUEST: `${BASE_URL}/api/service_certificate_requests`,
  SERVICE_CERTIFICATE_UPDATE: (id) => `${BASE_URL}/api/service_certificate_requests/${cleanId(id)}`,

  // =========================================================================
  // 6. RESIGNATIONS & PAYSLIPS
  // =========================================================================
  RESIGNATIONS: `${BASE_URL}/api/resignations`,
  RESIGNATIONS_GET: `${BASE_URL}/api/admin/resignations`,
  RESIGNATION_REQUEST: `${BASE_URL}/api/resignations`,
  RESIGNATION_UPDATE: (id) => `${BASE_URL}/api/admin/resignations/${cleanId(id)}/review`,
  TEAM_RESIGNATIONS: (tlId) => `${BASE_URL}/api/resignations/team/${cleanId(tlId)}`,
  REVOKE_RESIGNATION: (id) => `${BASE_URL}/api/resignations/revoke/${cleanId(id)}`,

  PAYSLIPS: `${BASE_URL}/api/payslips`,
  MY_PAYSLIPS: (userId) => `${BASE_URL}/api/pay-slips/my`,
  PAY_SLIP_POST: `${BASE_URL}/api/pay_slip`,

  // =========================================================================
  // 7. ENGAGEMENT & REWARDS
  // =========================================================================
  SUGGESTIONS: `${BASE_URL}/api/suggestions`,
  SUGGESTIONS_ADMIN: `${BASE_URL}/api/admin/suggestions`,
  SUPPORT_TICKETS: `${BASE_URL}/api/support-tickets`,
  UPDATE_TICKET: (id) => `${BASE_URL}/api/support-tickets/${cleanId(id)}`,
  SUPPORT_AGENTS: `${BASE_URL}/api/support-agents`,

  REWARDS: `${BASE_URL}/api/rewards`,
  REWARDS_MY: `${BASE_URL}/api/rewards/my`,
  REWARDS_ALL: `${BASE_URL}/api/rewards`,
  REWARDS_HISTORY: `${BASE_URL}/api/admin/rewards/history`,
  REWARDS_GIVE: `${BASE_URL}/api/rewards`,
  REWARDS_GIVEN: (userId) => `${BASE_URL}/api/rewards/given?userId=${cleanId(userId)}`,
  REWARDS_USER: (employeeId) => `${BASE_URL}/api/rewards/user/${cleanId(employeeId)}`,
  REWARDS_LEADERBOARD: `${BASE_URL}/api/rewards/leaderboard`,
  REWARD_EDIT: (id) => `${BASE_URL}/api/rewards/${cleanId(id)}`,
  REWARD_DELETE: (id) => `${BASE_URL}/api/rewards/${cleanId(id)}`,
  REWARD_CATEGORIES: `${BASE_URL}/api/rewards/categories`,
  REWARDS_GRANT_OPTIONS: `${BASE_URL}/api/rewards/grant-options`,
  REWARDS_GRANT: `${BASE_URL}/api/rewards/grant`,
  LEADERBOARD_ALL: `${BASE_URL}/api/employees/leaderboard/all`,

  // =========================================================================
  // 8. THREADS (Universal)
  // =========================================================================
  THREADS: `${BASE_URL}/api/threads`,
  THREAD_REACT: (id) => `${BASE_URL}/api/threads/${id}/react`,
  THREAD_REACTORS: (id, type) => `${BASE_URL}/api/threads/${id}/reactors${type ? `?type=${encodeURIComponent(type)}` : ''}`,
  THREAD_BADGE: (id) => `${BASE_URL}/api/threads/${id}/badge`,
  THREAD_COMMENT: (id) => `${BASE_URL}/api/threads/${id}/comment`,
  THREAD_COMMENTS: (id) => `${BASE_URL}/api/threads/${id}/comments`,
  THREAD_UPDATE: (id) => `${BASE_URL}/api/threads/${id}`,
  THREAD_DELETE: (id) => `${BASE_URL}/api/threads/${id}`,
  THREAD_USER: (userId) => `${BASE_URL}/api/threads/user/${userId}`,
  COMMENT_DELETE: (threadId, commentId) => `${BASE_URL}/api/threads/${threadId}/comments/${commentId}`,
  COMMENT_UPDATE: (threadId, commentId) => `${BASE_URL}/api/threads/${threadId}/comments/${commentId}`,

  // =========================================================================
  // 9. QUIZ & COURSES
  // =========================================================================
  QUIZZES_ALL: `${BASE_URL}/api/quizzes`,
  QUIZ_DATA: (quizId) => `${BASE_URL}/api/quizzes/${quizId}`,
  QUIZ_ANSWER: (quizId) => `${BASE_URL}/api/quizzes/${quizId}/answer`,
  FUN_QUIZZES: `${BASE_URL}/api/fun-quizzes`,
  QUIZ_SUBMIT_SESSION: `${BASE_URL}/api/quizzes/submit-session`,
  QUIZ_SUBMIT_TOTAL: `${BASE_URL}/api/quizzes/submit-total`,
  QUIZ_SUBMIT_ANSWER: `${BASE_URL}/api/fun-quizzes/submit-answer`,

  COURSES: `${BASE_URL}/api/courses`,
  BANK_IFSC: (code) => `${BASE_URL}/api/bank/ifsc/${code}`,

  // Stats
  DASHBOARD_STATS: `${BASE_URL}/api/dashboard-stats`,
  TEST_DB: `${BASE_URL}/api/test-db`,
  ROSTER: (type) => `${BASE_URL}/api/roster/${type}`,
};
