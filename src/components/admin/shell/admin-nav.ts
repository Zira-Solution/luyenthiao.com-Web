import {
  Bell,
  BookOpen,
  Building2,
  ClipboardCheck,
  Database,
  FileText,
  Globe,
  History,
  LayoutDashboard,
  Sliders,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type AdminNavBadgeKey = 'pendingGrading'

export interface AdminNavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
  badgeKey?: AdminNavBadgeKey
}

export interface AdminNavGroup {
  label: string
  items: readonly AdminNavItem[]
}

/** Single source of the admin sidebar menu: adding an admin page means adding one item here. */
export const ADMIN_NAV: readonly AdminNavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      {
        label: 'Trang tổng quan',
        href: '/admin',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: 'Nội dung & Đánh giá',
    items: [
      { label: 'Đề thi', href: '/admin/exam', icon: FileText },
      { label: 'Kho câu hỏi', href: '/admin/questions', icon: Database },
      {
        label: 'Chấm bài',
        href: '/admin/grading',
        icon: ClipboardCheck,
        badgeKey: 'pendingGrading',
      },
      { label: 'Từ vựng', href: '/admin/vocab', icon: BookOpen },
    ],
  },
  {
    label: 'Thế giới & Giao diện',
    items: [
      { label: 'Hành tinh', href: '/admin/planets', icon: Globe },
      { label: 'Cấu hình trang chủ', href: '/admin/site-config', icon: Sliders },
    ],
  },
  {
    label: 'Cộng đồng & Học tập',
    items: [
      { label: 'Nhiệm vụ', href: '/admin/tasks', icon: Trophy },
      { label: 'Trường học', href: '/admin/schools', icon: Building2 },
      { label: 'Thông báo', href: '/admin/notifications', icon: Bell },
      { label: 'Người dùng', href: '/admin/users', icon: Users },
    ],
  },
  {
    label: 'Giám sát hệ thống',
    items: [
      { label: 'Lịch sử làm bài', href: '/admin/attempts', icon: History },
      { label: 'Đấu trường & Điểm', href: '/admin/challenges', icon: Swords },
    ],
  },
]
