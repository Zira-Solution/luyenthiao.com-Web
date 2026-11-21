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
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { GameButton } from '@/components/ui/game-button'
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

/**
 * LoginForm
 * Playful, tactile game UI login panel matching Flyer homepage aesthetic:
 * - Rounded 28px card with soft pearl cream-white glassmorphism & delicate border
 * - Heading in playful font-heading and deep sky-950 tone
 * - Rounded input fields with subtle pastel background and warm amber focus states
 * - 3D claymorphic GameButton with tactile press affordance for primary submit
 * - Refined secondary Google login button
 * - Preserves 100% of authentication handling, state management, and validation
 */
export function LoginForm(): React.ReactElement {
  const login = useLogin()
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('resetSuccess') === '1'
  const redirectTo = safeRedirectPath(searchParams.get('redirect'))
  const status = useAuthStore((state) => state.status)
  const [showPassword, setShowPassword] = useState(false)

  // One navigation path for both fresh login and authenticated visitors
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
    <div className="xs:max-w-[360px] xs:p-6 relative w-full max-w-[340px] rounded-[24px] border-2 border-white/90 bg-white/90 p-5 shadow-[0_20px_50px_rgba(20,50,110,0.12)] backdrop-blur-xl sm:max-w-[420px] sm:rounded-[28px] sm:p-8">
      {/* 1. Panel Heading */}
      <div className="mb-4 flex flex-col items-center text-center sm:mb-6">
        <h2 className="font-heading text-2xl font-black tracking-tight text-[#6534B5] sm:text-3xl">
          Đăng nhập
        </h2>
        <p className="mt-0.5 text-xs font-semibold text-slate-500 sm:mt-1 sm:text-sm">
          Chào mừng bạn đến với thế giới diệu kỳ!
        </p>
      </div>

      {/* 2. Reset Password Success Notice */}
      {resetSuccess && !errorMessage && (
        <div className="mb-3.5 flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50/95 p-2.5 text-xs font-bold text-emerald-800 shadow-xs sm:mb-4 sm:p-3 sm:text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.</span>
        </div>
      )}

      {/* 3. Error Notice */}
      {errorMessage && (
        <div className="mb-3.5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/95 p-2.5 text-xs font-bold text-rose-700 shadow-xs sm:mb-4 sm:p-3 sm:text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4. Functional Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3 sm:gap-3.5">
        {/* Field 1: Phone or Username */}
        <div className="w-full">
          <div className="group relative flex h-[48px] w-full items-center rounded-2xl border-2 border-sky-100/90 bg-sky-50/50 px-3.5 transition-all duration-200 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20 hover:bg-white sm:h-[52px] sm:px-4">
            <User className="h-4.5 w-4.5 shrink-0 text-sky-600 transition-colors sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Số điện thoại hoặc tên đăng nhập"
              className="ml-2.5 w-full bg-transparent text-xs font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:outline-none sm:ml-3 sm:text-sm"
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
          <div className="group relative flex h-[48px] w-full items-center rounded-2xl border-2 border-sky-100/90 bg-sky-50/50 px-3.5 transition-all duration-200 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20 hover:bg-white sm:h-[52px] sm:px-4">
            <Lock className="h-4.5 w-4.5 shrink-0 text-sky-600 transition-colors sm:h-5 sm:w-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              className="ml-2.5 w-full bg-transparent text-xs font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:outline-none sm:ml-3 sm:text-sm"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 shrink-0 cursor-pointer p-1 text-slate-400 transition-colors hover:text-sky-600 focus:outline-none"
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

        {/* Forgot Password Link */}
        <div className="flex w-full justify-end pt-0.5">
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-sky-700 transition-colors hover:text-sky-900 hover:underline sm:text-sm"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Primary Login Button (3D Claymorphic GameButton) */}
        <div className="mt-1 flex w-full justify-center">
          <GameButton type="submit" variant="primary" disabled={login.isPending} className="w-full">
            {login.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang đăng nhập...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <span>Đăng nhập</span>
                <ChevronRight className="h-5 w-5 stroke-[3] text-white/95" />
              </span>
            )}
          </GameButton>
        </div>
      </form>

      {/* 5. Divider */}
      <div className="relative my-3.5 flex items-center justify-center sm:my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <span className="relative bg-white/90 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase sm:text-xs">
          Hoặc đăng nhập bằng
        </span>
      </div>

      {/* 6. Clean Google Sign-in Button */}
      <button
        type="button"
        className="group flex h-[46px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200/90 bg-white px-4 shadow-[0_4px_12px_rgba(100,110,180,0.06)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-[1px] sm:h-[48px]"
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

      {/* 7. Footer Registration Link */}
      <div className="mt-3.5 flex items-center justify-center text-xs font-medium text-slate-600 sm:mt-5 sm:text-sm">
        <span>Chưa có tài khoản?</span>
        <Link
          href="/signup"
          className="ml-1.5 font-black text-sky-700 underline transition-colors hover:text-sky-900"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  )
}
