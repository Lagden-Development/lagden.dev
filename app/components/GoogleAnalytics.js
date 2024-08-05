// components/GoogleAnalytics.js
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ReactGA from "react-ga";

const GA_TRACKING_ID = "G-JHDS9FXCK2";

ReactGA.initialize(GA_TRACKING_ID);

const GoogleAnalytics = () => {
  const pathname = usePathname();

  useEffect(() => {
    const handleRouteChange = (url) => {
      ReactGA.pageview(url);
    };

    // Track the initial page load
    ReactGA.pageview(window.location.pathname + window.location.search);

    // Listen for page changes
    handleRouteChange(pathname);
  }, [pathname]);

  return null;
};

export default GoogleAnalytics;
