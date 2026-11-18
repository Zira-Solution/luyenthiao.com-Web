"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuthStore } from "@/store/auth-store";

export interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * UX guard only: server-component children are still rendered into the RSC payload, so never rely on it to hide
 * server-fetched data. The backend authorises every call.
 */
export function RequireAuth({ children }: RequireAuthProps): React.ReactElement | null {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const signedOut = useAuthStore((state) => state.signedOut);

  // signedOut is honoured only by an instance that saw the session while mounted: a fresh mount after a logout
  // (e.g. a cached prefetched page) must still go to /login.
  const hadSession = useRef(false);

  useEffect(() => {
    if (status === "authenticated") {
      hadSession.current = true;
      return;
    }
    if (status !== "unauthenticated") return;
    if (signedOut && hadSession.current) {
      router.replace("/");
      return;
    }
    // window.location, not useSearchParams: that hook would force a Suspense boundary on every guarded layout.
    const current = `${window.location.pathname}${window.location.search}`;
    router.replace(`/login?${new URLSearchParams({ redirect: current }).toString()}`);
  }, [status, signedOut, router]);

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
