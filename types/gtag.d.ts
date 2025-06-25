// Type definitions for Google Analytics
interface Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set' | 'consent',
    target: string | Date,
    options?: {
      [key: string]: any;
    }
  ) => void;
  dataLayer: any[];
}
