'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  User,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { GameButton } from '@/components/ui/game-button'
import { useRegister } from '@/hooks'
import { ApiError } from '@/lib/api-client'
import { z } from '@/lib/zod'

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
      .max(50, 'Tên đăng nhập tối đa 50 ký tự'),
    fullName: z.string().min(1, 'Vui lòng nhập họ tên').max(150, 'Họ tên tối đa 150 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(72, 'Mật khẩu tối đa 72 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

/**
 * SignupForm
 * Playful, tactile game UI registration panel inheriting the exact visual styling of LoginForm:
 * - Rounded 28px card with soft pearl cream-white glassmorphism & delicate border
 * - Heading in playful font-heading and royal violet tone (#6534B5)
 * - Rounded input fields with subtle pastel background and warm amber focus states
 * - 3D claymorphic GameButton with tactile press affordance for primary submit
 * - Unified Google / Facebook secondary buttons
 * - Seamless responsive behavior across all viewports
 */
export function SignupForm(): React.ReactElement {
  const router = useRouter()
  const registerUser = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) })

  const onSubmit = (values: SignupFormValues): void => {
    registerUser.mutate(
      {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
      },
      { onSuccess: () => router.push('/') },
    )
  }

  const errorMessage =
    registerUser.error instanceof ApiError
      ? registerUser.error.message
      : registerUser.error
        ? 'Đã có lỗi xảy ra, vui lòng thử lại.'
        : null

  return (
    <div className="xs:max-w-[360px] xs:p-6 relative w-full max-w-[340px] rounded-[24px] border-2 border-white/90 bg-white/90 p-5 shadow-[0_20px_50px_rgba(20,50,110,0.12)] backdrop-blur-xl sm:max-w-[440px] sm:rounded-[28px] sm:p-7 md:p-8">
      {/* 1. Panel Heading */}
      <div className="mb-3.5 flex flex-col items-center text-center sm:mb-4.5">
        <h2 className="font-heading text-2xl font-black tracking-tight text-[#6534B5] sm:text-3xl">
          Đăng ký tài khoản
        </h2>
        <p className="mt-0.5 text-xs font-semibold text-slate-500 sm:mt-1 sm:text-sm">
          Cùng khám phá vương quốc học tập diệu kỳ!
        </p>
      </div>

      {/* 2. Error Notice */}
      {errorMessage && (
        <div className="mb-3 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/95 p-2.5 text-xs font-bold text-rose-700 shadow-xs sm:mb-3.5 sm:p-3 sm:text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Functional Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-2.5 sm:gap-3">
        {/* Field 1: Username */}
        <div className="w-full">
          <div className="group relative flex h-[44px] w-full items-center rounded-2xl border-2 border-sky-100/90 bg-sky-50/50 px-3.5 transition-all duration-200 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20 hover:bg-white sm:h-[48px] sm:px-4">
            <User className="h-4 w-4 shrink-0 text-sky-600 transition-colors sm:h-4.5 sm:w-4.5" />
            <input
              type="text"
              placeholder="Tên đăng nhập (tối thiểu 3 ký tự)"
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

        {/* Field 2: Full Name */}
        <div className="w-full">
          <div className="group relative flex h-[44px] w-full items-center rounded-2xl border-2 border-sky-100/90 bg-sky-50/50 px-3.5 transition-all duration-200 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20 hover:bg-white sm:h-[48px] sm:px-4">
            <UserCheck className="h-4 w-4 shrink-0 text-sky-600 transition-colors sm:h-4.5 sm:w-4.5" />
            <input
              type="text"
              placeholder="Họ và tên của bạn"
              className="ml-2.5 w-full bg-transparent text-xs font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:outline-none sm:ml-3 sm:text-sm"
              {...register('fullName')}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 ml-3 flex items-center gap-1 text-[11px] font-bold text-rose-500 sm:text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.fullName.message}</span>
            </p>
          )}
        </div>

        {/* Field 3: Email */}
        <div className="w-full">
          <div className="group relative flex h-[44px] w-full items-center rounded-2xl border-2 border-sky-100/90 bg-sky-50/50 px-3.5 transition-all duration-200 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20 hover:bg-white sm:h-[48px] sm:px-4">
            <Mail className="h-4 w-4 shrink-0 text-sky-600 transition-colors sm:h-4.5 sm:w-4.5" />
            <input
              type="email"
              placeholder="Địa chỉ email"
              className="ml-2.5 w-full bg-transparent text-xs font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:outline-none sm:ml-3 sm:text-sm"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="mt-1 ml-3 flex items-center gap-1 text-[11px] font-bold text-rose-500 sm:text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>

        {/* Field 4: Password */}
        <div className="w-full">
          <div className="group relative flex h-[44px] w-full items-center rounded-2xl border-2 border-sky-100/90 bg-sky-50/50 px-3.5 transition-all duration-200 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20 hover:bg-white sm:h-[48px] sm:px-4">
            <Lock className="h-4 w-4 shrink-0 text-sky-600 transition-colors sm:h-4.5 sm:w-4.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
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
                <EyeOff className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              ) : (
                <Eye className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
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

        {/* Field 5: Confirm Password */}
        <div className="w-full">
          <div className="group relative flex h-[44px] w-full items-center rounded-2xl border-2 border-sky-100/90 bg-sky-50/50 px-3.5 transition-all duration-200 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20 hover:bg-white sm:h-[48px] sm:px-4">
            <KeyRound className="h-4 w-4 shrink-0 text-sky-600 transition-colors sm:h-4.5 sm:w-4.5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu xác nhận"
              className="ml-2.5 w-full bg-transparent text-xs font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:outline-none sm:ml-3 sm:text-sm"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="ml-2 shrink-0 cursor-pointer p-1 text-slate-400 transition-colors hover:text-sky-600 focus:outline-none"
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              ) : (
                <Eye className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 ml-3 flex items-center gap-1 text-[11px] font-bold text-rose-500 sm:text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.confirmPassword.message}</span>
            </p>
          )}
        </div>

        {/* 4. Primary CTA Register Button */}
        <div className="mt-1 flex w-full justify-center">
          <GameButton
            type="submit"
            variant="cta"
            className="w-full"
            disabled={registerUser.isPending}
          >
            {registerUser.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang đăng ký...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <span>Đăng ký ngay</span>
                <ChevronRight className="h-5 w-5 stroke-[3] text-white/95" />
              </span>
            )}
          </GameButton>
        </div>
      </form>

      {/* 5. Divider */}
      <div className="relative my-3 flex items-center justify-center sm:my-3.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white/95 px-3 text-[11px] font-bold tracking-wide text-slate-400 uppercase sm:text-xs">
          Hoặc đăng ký với
        </span>
      </div>

      {/* 6. Social Buttons */}
      <div className="flex w-full gap-2.5 sm:gap-3">
        {/* Google */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex h-[40px] flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border-2 border-slate-200/80 bg-slate-50 font-bold text-slate-700 shadow-xs sm:h-[44px]"
        >
          <svg className="h-4 w-4 opacity-60 sm:h-4.5 sm:w-4.5" viewBox="0 0 24 24">
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
          <span className="flex flex-col items-start gap-0.5 leading-none">
            <span className="font-heading text-xs font-black tracking-wide sm:text-sm">Google</span>
            <span className="rounded-full bg-slate-200 px-1.5 py-px text-[9px] leading-tight font-bold text-slate-700">
              Sắp có
            </span>
          </span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex h-[40px] flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border-2 border-[#166fe5]/30 bg-[#166fe5] font-bold text-white shadow-xs sm:h-[44px]"
        >
          <svg className="h-4 w-4 fill-white opacity-70 sm:h-4.5 sm:w-4.5" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="flex flex-col items-start gap-0.5 leading-none">
            <span className="font-heading text-xs font-black tracking-wide sm:text-sm">
              Facebook
            </span>
            <span className="rounded-full bg-white px-1.5 py-px text-[9px] leading-tight font-bold text-[#166fe5]">
              Sắp có
            </span>
          </span>
        </button>
      </div>

      {/* 7. Footer Redirect to Login */}
      <div className="mt-3.5 text-center text-xs text-slate-500 sm:mt-4 sm:text-sm">
        <span>Đã có tài khoản? </span>
        <Link
          href="/login"
          className="font-extrabold text-[#6534B5] transition-colors hover:text-[#522998] hover:underline"
        >
          Đăng nhập ngay!
        </Link>
      </div>
    </div>
  )
}
