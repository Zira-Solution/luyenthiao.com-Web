"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";

export function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple validation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    if (formData.phone.length < 10) {
      setError("Số điện thoại không hợp lệ!");
      return;
    }

    // Success redirect
    alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
    router.push("/login");
  };

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center text-shadow-game-title">
      {/* Premium Glassmorphic / Claymorphic Signup Card */}
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
        
        {/* Title */}
        <h1 
          className="text-4xl md:text-5xl font-black uppercase text-center text-white tracking-wider mb-8 font-heading text-shadow-game-title"
          
        >
          ĐĂNG KÝ
        </h1>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center text-shadow-game-title">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 text-shadow-game-title">
          
          {/* Name Field */}
          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Tên học sinh
            </label>
            <GameInput 
              name="name"
              type="text" 
              placeholder="Nhập tên học sinh" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Phone Field */}
          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Số điện thoại phụ huynh
            </label>
            <GameInput 
              name="phone"
              type="tel" 
              placeholder="Nhập số điện thoại" 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Password Field */}
          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Mật khẩu
            </label>
            <GameInput 
              name="password"
              type="password" 
              placeholder="Mật khẩu (tối thiểu 6 ký tự)" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Nhập lại mật khẩu
            </label>
            <GameInput 
              name="confirmPassword"
              type="password" 
              placeholder="Xác nhận mật khẩu" 
              required 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <div className="mt-4 flex justify-center text-shadow-game-title">
            <GameButton className="w-full max-w-[260px] text-shadow-game-title" type="submit" variant="cta">
              ĐĂNG KÝ NGAY
            </GameButton>
          </div>

        </form>

        {/* Divider */}
        <div className="relative my-8 flex items-center justify-center text-shadow-game-title">
          <div className="absolute inset-0 flex items-center text-shadow-game-title">
            <div className="w-full border-t border-white/10 text-shadow-game-title"></div>
          </div>
          <span className="relative bg-ranking-table-bg px-4 text-xs font-bold text-white/40 uppercase tracking-widest text-shadow-game-title">
            Hoặc đăng ký với
          </span>
        </div>

        {/* Social Logins */}
        <div className="flex gap-4 items-center justify-center text-shadow-game-title">
          {/* Google Button */}
          <button 
            type="button" 
            className="flex-1 max-w-[140px] relative group active:translate-y-[2px] transition-all duration-100 cursor-pointer text-shadow-game-title"
          >
            <div className="absolute inset-x-0 -bottom-1 h-full rounded-xl bg-gray-300 -z-10 group-active:bottom-0 shadow-md text-shadow-game-title" />
            <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-shadow-game-title">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-gray-700 font-black text-xs uppercase tracking-wide text-shadow-game-title">Google</span>
            </div>
          </button>

          {/* Facebook Button */}
          <button 
            type="button" 
            className="flex-1 max-w-[140px] relative group active:translate-y-[2px] transition-all duration-100 cursor-pointer text-shadow-game-title"
          >
            <div className="absolute inset-x-0 -bottom-1 h-full rounded-xl bg-facebook-shadow -z-10 group-active:bottom-0 shadow-md text-shadow-game-title" />
            <div className="bg-facebook-bg border-2 border-facebook-shadow rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-facebook-hover transition-colors text-shadow-game-title">
              <svg width="18" height="18" fill="#ffffff" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-white font-black text-xs uppercase tracking-wide text-shadow-game-title">Facebook</span>
            </div>
          </button>
        </div>

      </div>

      {/* Login Link */}
      <div className="mt-8 text-white font-medium bg-ranking-table-bg/40 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/5 shadow-md text-shadow-game-title">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-blue-300 font-bold hover:underline hover:text-blue-200 ml-1 text-shadow-game-title">
          Đăng nhập ngay!
        </Link>
      </div>
    </div>
  );
}
