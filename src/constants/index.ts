export const APP_NAME = 'English Game'
export const APP_DESCRIPTION =
  'English Game — placeholder description, update once the product direction is defined.'

export const ROUTES = {
  HOME: '/',
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
