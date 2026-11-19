import type { Metadata } from "next";

import { ChangePasswordForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  description: "Đổi mật khẩu tài khoản của bạn.",
  keywords: ["đổi mật khẩu", "tài khoản"],
  alternates: { canonical: "/account/change-password" },
  openGraph: {
    title: "Đổi mật khẩu",
    description: "Đổi mật khẩu tài khoản của bạn.",
  },
};

export default function ChangePasswordPage(): React.ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-page-bg px-4 py-12">
      <ChangePasswordForm />
    </main>
  );
}
