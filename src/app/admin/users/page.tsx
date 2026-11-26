import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { UsersAdminView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Quản lý Người dùng | Luyenthiao CMS',
  description:
    'Quản lý tài khoản học viên/quản trị viên, phân quyền, gán trường và khóa tài khoản.',
  keywords: ['admin', 'users', 'roles', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/users' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Quản lý Người dùng | Luyenthiao CMS',
    description: 'Quản lý người dùng Luyenthiao CMS.',
  },
}

export default function AdminUsersPage(): ReactElement {
  return <UsersAdminView />
}
