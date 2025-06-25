/**
 * Google Analytics utility for tracking events beyond page views
 */

// Track specific event actions
export const trackEvent = (
  action: string, 
  category: string,
  label?: string, 
  value?: number
) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track visualization interactions
export const trackVisualization = (
  algorithmName: string, 
  action: 'start' | 'complete' | 'interact'
) => {
  trackEvent(action, 'visualization', algorithmName);
};

// Track note views
export const trackNoteView = (noteName: string) => {
  trackEvent('view', 'notes', noteName);
};

// Track user authentication events
export const trackAuthEvent = (
  action: 'login' | 'signup' | 'logout'
) => {
  trackEvent(action, 'authentication');
};
