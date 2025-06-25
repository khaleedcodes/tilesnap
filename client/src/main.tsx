import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import ReactGA from "react-ga4";
ReactGA.initialize("G-8HTGM73KG5");

ReactGA.send({
  hitType: "pageview",
  page: window.location.pathname,
  title: "pageview from main.tsx",
});

createRoot(document.getElementById("root")!).render(<App />);
