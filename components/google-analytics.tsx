"use client";

import Script from "next/script";
import { useEffect, Suspense } from "react";
import ClientOnly from "./client-only";

// Google Analytics Measurement ID from environment variable
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-LFH64YFTY9";

// Declare the gtag function
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent', 
      target: string | Date, 
      options?: { [key: string]: any }
    ) => void;
    dataLayer: any[];
  }
}

// Analytics component that uses the search params
function AnalyticsTracking() {
  // Import these inside the component to ensure they're only used client-side
  const { usePathname, useSearchParams } = require("next/navigation");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      if (pathname && typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
        // Send page views when the path changes
        window.gtag("config", GA_MEASUREMENT_ID, {
          page_path: pathname + (searchParams ? searchParams.toString() : ''),
        });
      }
    } catch (error) {
      console.error("Error in analytics tracking:", error);
    }
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname + window.location.search,
          });
        `}
      </Script>
      <ClientOnly>
        <Suspense fallback={null}>
          <AnalyticsTracking />
        </Suspense>
      </ClientOnly>
    </>
  );
}
