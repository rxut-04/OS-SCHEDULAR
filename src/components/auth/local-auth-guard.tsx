"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LOCAL_SIGNIN_KEY } from "@/components/auth/auth-form";

/**
 * Redirects to /login if local sign-in key is missing (no database auth).
 */
export function LocalAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const signedIn = window.localStorage.getItem(LOCAL_SIGNIN_KEY);
    if (!signedIn) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
