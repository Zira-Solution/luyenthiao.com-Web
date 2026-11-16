import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME, ROUTES } from "@/constants";

const DESCRIPTION = `Đăng nhập tài khoản ${APP_NAME} để làm bài thi thử và theo dõi tiến độ luyện tiếng Anh.`;

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: DESCRIPTION,
  keywords: ["đăng nhập", "login", APP_NAME],
  alternates: { canonical: ROUTES.LOGIN },
  openGraph: {
    title: "Đăng nhập",
    description: DESCRIPTION,
  },
};

export default function LoginPage(): React.ReactElement {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
