"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";
import { useRegister } from "@/hooks/auth";
import { ApiError } from "@/lib/api-client";

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
      .max(50, "Tên đăng nhập tối đa 50 ký tự"),
    fullName: z.string().min(1, "Vui lòng nhập họ tên"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm(): React.ReactElement {
  const router = useRouter();
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = (values: SignupFormValues): void => {
    registerUser.mutate(
      {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
      },
      { onSuccess: () => router.push("/") },
    );
  };

  const errorMessage =
    registerUser.error instanceof ApiError
      ? registerUser.error.message
      : registerUser.error
        ? "Đã có lỗi xảy ra, vui lòng thử lại."
        : null;

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center text-shadow-game-title">
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-center text-white tracking-wider mb-8 font-heading text-shadow-game-title">
          ĐĂNG KÝ
        </h1>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center text-shadow-game-title">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-5 text-shadow-game-title"
        >
          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Tên đăng nhập
            </label>
            <GameInput type="text" placeholder="Tên đăng nhập" {...register("username")} />
            {errors.username && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.username.message}</p>
            )}
          </div>

          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Họ và tên
            </label>
            <GameInput type="text" placeholder="Nhập họ và tên" {...register("fullName")} />
            {errors.fullName && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.fullName.message}</p>
            )}
          </div>

          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Email
            </label>
            <GameInput type="email" placeholder="Nhập email" {...register("email")} />
            {errors.email && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.email.message}</p>
            )}
          </div>

          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Mật khẩu
            </label>
            <GameInput type="password" placeholder="Mật khẩu (tối thiểu 8 ký tự)" {...register("password")} />
            {errors.password && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.password.message}</p>
            )}
          </div>

          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Nhập lại mật khẩu
            </label>
            <GameInput
              type="password"
              placeholder="Xác nhận mật khẩu"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-center text-shadow-game-title">
            <GameButton
              className="w-full max-w-[260px] text-shadow-game-title"
              type="submit"
              variant="cta"
              disabled={registerUser.isPending}
            >
              {registerUser.isPending ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ NGAY"}
            </GameButton>
          </div>
        </form>

        <div className="relative my-8 flex items-center justify-center text-shadow-game-title">
          <div className="absolute inset-0 flex items-center text-shadow-game-title">
            <div className="w-full border-t border-white/10 text-shadow-game-title"></div>
          </div>
          <span className="relative bg-ranking-table-bg px-4 text-xs font-bold text-white/40 uppercase tracking-widest text-shadow-game-title">
            Hoặc đăng ký với
          </span>
        </div>

        <div className="flex gap-4 items-center justify-center text-shadow-game-title">
          <button
            type="button"
            className="flex-1 max-w-[140px] relative group active:translate-y-[2px] transition-all duration-100 cursor-pointer text-shadow-game-title"
          >
            <div className="absolute inset-x-0 -bottom-1 h-full rounded-xl bg-gray-300 -z-10 group-active:bottom-0 shadow-md text-shadow-game-title" />
            <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-shadow-game-title">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-black text-xs uppercase tracking-wide text-shadow-game-title">
                Google
              </span>
            </div>
          </button>

          <button
            type="button"
            className="flex-1 max-w-[140px] relative group active:translate-y-[2px] transition-all duration-100 cursor-pointer text-shadow-game-title"
          >
            <div className="absolute inset-x-0 -bottom-1 h-full rounded-xl bg-facebook-shadow -z-10 group-active:bottom-0 shadow-md text-shadow-game-title" />
            <div className="bg-facebook-bg border-2 border-facebook-shadow rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-facebook-hover transition-colors text-shadow-game-title">
              <svg width="18" height="18" fill="#ffffff" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-white font-black text-xs uppercase tracking-wide text-shadow-game-title">
                Facebook
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-8 text-white font-medium bg-ranking-table-bg/40 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/5 shadow-md text-shadow-game-title">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-blue-300 font-bold hover:underline hover:text-blue-200 ml-1 text-shadow-game-title"
        >
          Đăng nhập ngay!
        </Link>
      </div>
    </div>
  );
}
