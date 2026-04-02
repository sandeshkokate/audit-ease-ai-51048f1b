import { createRoot } from "react-dom/client";
import { validateEnv } from "./lib/env-validation";
import { primeSupabasePublicConfig } from "./lib/supabase-public-config";
import { initSentry } from "./lib/sentry";
import "./index.css";

async function bootstrap() {
  // Validate environment before anything else
  validateEnv();

  await primeSupabasePublicConfig();

  // Initialize error monitoring
  initSentry();

  const { default: App } = await import("./App.tsx");

  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
