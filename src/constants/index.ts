export const APP_NAME = 'luyenthiao.com'
export const APP_DESCRIPTION =
  'Luyện thi tiếng Anh trực tuyến: làm bài thi thử, luyện Nghe, Nói, Đọc, Viết và theo dõi tiến bộ.'

export const ROUTES = {
  HOME: '/',
  HISTORY: '/history',
  NOTEBOOK: '/notebook',
  NOTIFICATIONS: '/notifications',
  PLACEMENT_TEST: '/placement-test',
  RANKING: '/ranking',
  SCHOOL_RANKING: '/school-ranking',
  TASKS: '/tasks',
  TEST_RESULT: '/testresult',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCOUNT_CHANGE_PASSWORD: '/account/change-password',
  ADMIN_EXAM: '/admin/exam',
  ADMIN_EXAM_DETAIL: '/admin/exam/[id]',
  WRITE_TEST: '/write/[slug]',
  WRITE_RESULT: '/write/result/[id]',
  SPEAKING_TEST: '/speaking/[slug]',
  SPEAKING_RESULT: '/speaking/result/[id]',
  SPEAKING_PREVIEW: '/speaking/result/[id]/preview',
} as const

/** Đề mock duy nhất hiện có — liên kết tạm cho nút Writing/Speaking trên topbar, thay bằng danh sách đề từ API khi có. */
export const DEMO_WRITE_TEST_PATH = '/write/writing-demo-1'
export const DEMO_SPEAKING_TEST_PATH = '/speaking/speaking-demo-1'

export * from './mascot'
