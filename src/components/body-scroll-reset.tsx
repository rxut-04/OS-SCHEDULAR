'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Ensures body scroll is enabled on every page load and route change.
 * Prevents stuck scroll when navigating from overlays (e.g. Exercises) or any
 * component that sets document.body.style.overflow = 'hidden'.
 */
export function BodyScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  }, [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  return null;
}
