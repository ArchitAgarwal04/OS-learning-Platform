'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// This component handles SPA page views for Google Analytics
export default function GoogleTagManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && typeof window.gtag !== 'undefined') {
      // Send a pageview when the route changes
      window.gtag('config', 'G-LFH64YFTY9', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}

// Add this type declaration for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (command: 'config' | 'event' | 'js' | 'set' | 'consent', target: string | Date, options?: { [key: string]: any }) => void;
  }
}
