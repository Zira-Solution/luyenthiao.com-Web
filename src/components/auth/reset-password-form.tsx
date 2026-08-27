"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";
import { useResetPassword } from "@/hooks/auth";
import { ApiError } from "@/lib/api-client";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Vui lòng nhập mã đặt lại mật khẩu"),
    newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmNewPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  initialToken: string;
}

export function ResetPasswordForm({ initialToken }: ResetPasswordFormProps): React.ReactElement {
  const router = useRouter();
  const resetPassword = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: initialToken, newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = (values: ResetPasswordFormValues): void => {
    resetPassword.mutate(
      { token: values.token, newPassword: values.newPassword },
      { onSuccess: () => router.push("/login?resetSuccess=1") },
    );
  };

  const errorMessage =
    resetPassword.error instanceof ApiError
      ? resetPassword.error.message
      : resetPassword.error
        ? "Đã có lỗi xảy ra, vui lòng thử lại."
        : null;

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center text-shadow-game-title">
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-center text-white tracking-wider mb-8 font-heading">
          ĐẶT LẠI MẬT KHẨU
        </h1>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Mã đặt lại mật khẩu
            </label>
            <GameInput type="text" placeholder="Dán mã từ email vào đây" {...register("token")} />
            {errors.token && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.token.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Mật khẩu mới
            </label>
            <GameInput type="password" placeholder="Mật khẩu mới" {...register("newPassword")} />
            {errors.newPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Nhập lại mật khẩu mới
            </label>
            <GameInput
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              {...register("confirmNewPassword")}
            />
            {errors.confirmNewPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <GameButton
              className="w-full max-w-[260px]"
              type="submit"
              variant="primary"
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? "ĐANG XỬ LÝ..." : "ĐẶT LẠI MẬT KHẨU"}
            </GameButton>
          </div>
        </form>
      </div>

      <div className="mt-8 text-white font-medium bg-ranking-table-bg/40 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/5 shadow-md">
        <Link href="/login" className="text-blue-300 font-bold hover:underline hover:text-blue-200">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
