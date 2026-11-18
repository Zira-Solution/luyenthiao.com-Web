"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";
import { useForgotPassword } from "@/hooks";
import { ApiError } from "@/lib/api-client";
import { z } from "@/lib/zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm(): React.ReactElement {
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = (values: ForgotPasswordFormValues): void => {
    forgotPassword.mutate(values);
  };

  const errorMessage =
    forgotPassword.error instanceof ApiError
      ? forgotPassword.error.message
      : forgotPassword.error
        ? "Đã có lỗi xảy ra, vui lòng thử lại."
        : null;

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center text-shadow-game-title">
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-center text-white tracking-wider mb-4 font-heading text-shadow-game-title">
          QUÊN MẬT KHẨU
        </h1>
        <p className="text-center text-white/70 text-xs md:text-sm mb-8">
          Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </p>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        {forgotPassword.isSuccess && (
          <div className="mb-6 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold text-center">
            {forgotPassword.data.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Email
            </label>
            <GameInput type="email" placeholder="Email đã đăng ký" {...register("email")} />
            {errors.email && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.email.message}</p>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <GameButton
              className="w-full max-w-[260px]"
              type="submit"
              variant="primary"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? "ĐANG GỬI..." : "GỬI YÊU CẦU"}
            </GameButton>
          </div>
        </form>
      </div>

      <div className="mt-8 text-white font-medium bg-ranking-table-bg/40 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/5 shadow-md">
        Nhớ mật khẩu rồi?{" "}
        <Link href="/login" className="text-blue-300 font-bold hover:underline hover:text-blue-200 ml-1">
          Đăng nhập ngay!
        </Link>
      </div>
    </div>
  );
}
