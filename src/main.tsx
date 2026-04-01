import { createRoot } from "react-dom/client";
import { validateEnv } from "./lib/env-validation";
import { initSentry } from "./lib/sentry";
import App from "./App.tsx";
import "./index.css";

// Validate environment before anything else
validateEnv();

// Initialize error monitoring
initSentry();

createRoot(document.getElementById("root")!).render(<App />);
