'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useLogin } from '@/hooks'
import { ApiError } from '@/lib/api-client'
import { hardNavigate } from '@/lib/navigation'
import { safeRedirectPath } from '@/lib/safe-redirect'
import { z } from '@/lib/zod'
import { useAuthStore } from '@/store/auth-store'

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập số điện thoại hoặc tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm(): React.ReactElement {
  const login = useLogin()
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('resetSuccess') === '1'
  const redirectTo = safeRedirectPath(searchParams.get('redirect'))
  const status = useAuthStore((state) => state.status)
  const [showPassword, setShowPassword] = useState(false)

  // One navigation path for both cases: a fresh login, and a visitor whose refresh cookie is still valid
  useEffect(() => {
    if (status === 'authenticated') hardNavigate(redirectTo)
  }, [status, redirectTo])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = (values: LoginFormValues): void => {
    login.mutate(values)
  }

  const errorMessage =
    login.error instanceof ApiError
      ? login.error.message
      : login.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại.'
        : null

  return (
    <div className="short-landscape-form-scale relative flex w-full max-w-[420px] flex-col items-center">
      {/* 1. Hanging Wooden Sign Plank ("Đăng nhập") pinned at top */}
      <div className="relative z-30 -mb-6 flex justify-center sm:-mb-8">
        <Image
          src="/clone-assets/media/login_wood_sign.png"
          alt="Đăng nhập"
          width={280}
          height={78}
          className="pointer-events-none w-[200px] drop-shadow-[0_8px_18px_rgba(180,80,20,0.28)] select-none sm:w-[270px]"
          priority
        />
      </div>

      {/* 2. Puffy Cloud Card Container */}
      <div className="relative z-10 w-full">
        {/* Authentic 3D Cloud Background Shell */}
        <div className="pointer-events-none absolute inset-0 -z-10 drop-shadow-[0_20px_50px_rgba(110,90,210,0.2)]">
          <Image
            src="/clone-assets/media/login_cloud_card.png"
            alt="Cloud Card Background"
            fill
            className="object-fill"
            priority
          />
        </div>

        {/* Card Content Interior */}
        <div className="flex w-full flex-col px-5 pt-10 pb-5 sm:px-9 sm:pt-14 sm:pb-8">
          {/* Reset Password Success Notice */}
          {resetSuccess && !errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50/95 p-3 text-xs font-bold text-emerald-800 shadow-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.</span>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/95 p-3 text-xs font-bold text-rose-700 shadow-xs sm:text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-2.5 sm:gap-3.5">
            {/* Field 1: Username / Phone */}
            <div className="w-full">
              <div className="group relative flex w-full items-center rounded-full border border-[#d0d8f6] bg-[#f2f5fd] px-3.5 py-2.5 transition-all duration-200 focus-within:border-[#7c5cfc] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#7c5cfc]/15 hover:bg-white sm:px-4 sm:py-3.5">
                <User className="h-4.5 w-4.5 shrink-0 text-[#7c5cfc] transition-colors sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Số điện thoại hoặc tên đăng nhập"
                  className="ml-2.5 w-full bg-transparent text-xs font-bold text-slate-800 placeholder:font-medium placeholder:text-[#9098be] focus:outline-none sm:ml-3 sm:text-base"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="mt-1 ml-3 flex items-center gap-1 text-[11px] font-bold text-rose-500 sm:text-xs">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.username.message}</span>
                </p>
              )}
            </div>

            {/* Field 2: Password */}
            <div className="w-full">
              <div className="group relative flex w-full items-center rounded-full border border-[#d0d8f6] bg-[#f2f5fd] px-3.5 py-2.5 transition-all duration-200 focus-within:border-[#7c5cfc] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#7c5cfc]/15 hover:bg-white sm:px-4 sm:py-3.5">
                <Lock className="h-4.5 w-4.5 shrink-0 text-[#7c5cfc] transition-colors sm:h-5 sm:w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu"
                  className="ml-2.5 w-full bg-transparent text-xs font-bold text-slate-800 placeholder:font-medium placeholder:text-[#9098be] focus:outline-none sm:ml-3 sm:text-base"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 shrink-0 cursor-pointer p-1 text-[#7c5cfc] transition-colors hover:text-[#6039e8] focus:outline-none"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 ml-3 flex items-center gap-1 text-[11px] font-bold text-rose-500 sm:text-xs">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Forgot Password Link (Centered right under password field as in reference) */}
            <div className="flex w-full justify-center pt-0.5">
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-[#6d52e6] transition-colors hover:text-[#533bbd] hover:underline sm:text-sm"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Primary Action Button ("Đăng nhập >") */}
            <div className="mt-0.5 flex w-full justify-center sm:mt-1">
              <button
                type="submit"
                disabled={login.isPending}
                className="font-heading flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-b-[3px] border-amber-300/40 border-b-[#d46200] bg-gradient-to-r from-[#ff9f1c] via-[#ff8800] to-[#f57000] px-5 py-2.5 text-sm font-black tracking-wide text-white shadow-[0_8px_22px_rgba(251,140,0,0.38)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(251,140,0,0.48)] hover:brightness-105 active:translate-y-[2px] active:border-b-2 disabled:pointer-events-none disabled:opacity-60 sm:px-6 sm:py-3.5 sm:text-lg"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin sm:h-5 sm:w-5" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">Đăng nhập</span>
                    <ChevronRight className="h-4.5 w-4.5 stroke-[3] text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] sm:h-5 sm:w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-3 flex items-center justify-center sm:my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e7f8]"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold tracking-wider text-[#858aa5] sm:text-xs">
              Hoặc đăng nhập bằng
            </span>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#d4dbf7] bg-white px-3.5 py-2.5 shadow-[0_4px_12px_rgba(100,110,180,0.06)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#fafbfe] active:translate-y-[1px] sm:gap-2.5 sm:px-4 sm:py-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0 sm:h-5 sm:w-5">
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
            <span className="text-xs font-bold tracking-wide text-slate-700 sm:text-sm">
              Đăng nhập với Google
            </span>
          </button>

          {/* Footer Registration Link */}
          <div className="mt-3 flex items-center justify-center text-xs font-medium text-slate-600 sm:mt-5 sm:text-sm">
            <span>Chưa có tài khoản?</span>
            <Link
              href="/signup"
              className="ml-1.5 font-black text-[#7c3aed] underline transition-colors hover:text-[#6d28d9]"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
