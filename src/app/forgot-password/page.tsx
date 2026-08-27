import type { Metadata } from "next";
import Image from "next/image";

import { ForgotPasswordForm } from "@/components/auth";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: `Đặt lại mật khẩu tài khoản ${APP_NAME} qua email.`,
  keywords: ["quên mật khẩu", "đặt lại mật khẩu", APP_NAME],
  alternates: { canonical: "/forgot-password" },
  openGraph: {
    title: "Quên mật khẩu",
    description: `Đặt lại mật khẩu tài khoản ${APP_NAME} qua email.`,
  },
};

export default function ForgotPasswordPage(): React.ReactElement {
  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-page-bg px-4 py-12">
      <div className="absolute inset-0 z-0">
        <Image
          src="/clone-assets/bg.1e17df80.png"
          alt="Space Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative z-10">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
