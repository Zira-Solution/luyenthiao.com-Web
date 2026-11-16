import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { APP_NAME, ROUTES } from "@/constants";

const DESCRIPTION = `Tạo tài khoản ${APP_NAME} miễn phí để luyện thi tiếng Anh và lưu lại kết quả bài làm.`;

export const metadata: Metadata = {
  title: "Đăng ký",
  description: DESCRIPTION,
  keywords: ["đăng ký", "tạo tài khoản", "sign up", APP_NAME],
  alternates: { canonical: ROUTES.SIGNUP },
  openGraph: {
    title: "Đăng ký",
    description: DESCRIPTION,
  },
};

export default function SignupPage(): React.ReactElement {
  return (
    <AuthPageShell>
      <SignupForm />
    </AuthPageShell>
  );
}
