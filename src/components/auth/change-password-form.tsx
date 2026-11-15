"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";
import { useChangePassword } from "@/hooks";
import { ApiError } from "@/lib/api-client";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmNewPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm(): React.ReactElement {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = (values: ChangePasswordFormValues): void => {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: () => reset() },
    );
  };

  const errorMessage =
    changePassword.error instanceof ApiError
      ? changePassword.error.message
      : changePassword.error
        ? "Đã có lỗi xảy ra, vui lòng thử lại."
        : null;

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center">
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-center text-white tracking-wider mb-8 font-heading">
          ĐỔI MẬT KHẨU
        </h1>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        {changePassword.isSuccess && (
          <div className="mb-6 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold text-center">
            Đổi mật khẩu thành công. Các thiết bị khác đã bị đăng xuất.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Mật khẩu hiện tại
            </label>
            <GameInput type="password" placeholder="Mật khẩu hiện tại" {...register("currentPassword")} />
            {errors.currentPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">
                {errors.currentPassword.message}
              </p>
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
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? "ĐANG XỬ LÝ..." : "ĐỔI MẬT KHẨU"}
            </GameButton>
          </div>
        </form>
      </div>
    </div>
  );
}
