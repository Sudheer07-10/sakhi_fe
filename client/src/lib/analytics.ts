// Define gtag on window if not already defined for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Simple analytics wrapper
// In the future, this can be replaced with Mixpanel or custom backend logging if needed

type EventName =
    | 'journey_selected'
    | 'chat_message_sent'
    | 'story_viewed'
    | 'story_shared'
    | string; // Allow any string for custom events like tool usage

interface EventProperties {
    [key: string]: any;
}

export const trackEvent = (eventName: EventName, properties?: EventProperties) => {
    // 1. Log to console in development
    if (import.meta.env.DEV) {
        console.log(`📊 [Analytics] ${eventName}`, properties);
    }

    // 2. Track with Google Analytics if available
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, properties);
    }

    // 3. Optional: Send critical events to backend
    if (eventName === 'journey_selected') {
        // This is already handled by saveUserJourney, but we could track metadata here
    }
};

/**
 * Log a pageview to Google Analytics
 * @param url The path of the page (e.g. '/about')
 */
export const pageview = (url: string) => {
  if (typeof window.gtag === 'function') {
    // Note: We use window.gtag('config', id, {page_path}) but we need the ID.
    // If VITE_GA_MEASUREMENT_ID is missing in env, we can fallback to just sending a generic pageview event
    const gaId = "G-VV66HJZHWK";
    if (gaId) {
      window.gtag('config', gaId, {
        page_path: url,
      });
    } else {
      window.gtag('event', 'page_view', { page_path: url });
    }
  } else if (import.meta.env.DEV) {
    console.log(`📊 [Analytics] Pageview: ${url}`);
  }
};
