import { useEffect } from "react";
import { useLocation } from "wouter";
import { pageview } from "../lib/analytics";

/**
 * A component that listens to route changes and triggers
 * Google Analytics pageview events.
 */
export function AnalyticsTracker() {
  const [pathname] = useLocation();

  useEffect(() => {
    // Log the pageview whenever the pathname changes
    pageview(pathname);
  }, [pathname]);

  return null; // This component does not render anything
}
