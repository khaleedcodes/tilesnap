import { useEffect } from "react";
import { useLocation } from "wouter";
import ReactGA from "react-ga4";

export default function AnalyticsTracker() {
  const [location] = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location,
      title: `Pageview - ${location}`,
    });
  }, [location]);

  return null;
}
