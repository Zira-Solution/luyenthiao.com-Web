import type { Metadata } from "next";
import Image from "next/image";

import { ResetPasswordForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  description: "Đặt lại mật khẩu tài khoản bằng mã đã nhận qua email.",
  keywords: ["đặt lại mật khẩu", "reset password"],
  alternates: { canonical: "/reset-password" },
  openGraph: {
    title: "Đặt lại mật khẩu",
    description: "Đặt lại mật khẩu tài khoản bằng mã đã nhận qua email.",
  },
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps): Promise<React.ReactElement> {
  const { token } = await searchParams;

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-page-bg px-4 py-12">
      <div className="absolute inset-0 z-0">
        <Image
          src="/clone-assets/bg.1e17df80.webp"
          alt="Space Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative z-10">
        <ResetPasswordForm initialToken={token ?? ""} />
      </div>
    </main>
  );
}
