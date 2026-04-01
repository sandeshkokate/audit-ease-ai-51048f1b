import { createRoot } from "react-dom/client";
import { validateEnv } from "./lib/env-validation";
import { logger } from "./lib/logger";
import { initSentry } from "./lib/sentry";
import { initSupabaseClient } from "./integrations/supabase/client";
import App from "./App.tsx";
import "./index.css";

async function bootstrap() {
  // Validate environment before anything else
  validateEnv();

  await initSupabaseClient();

  // Initialize error monitoring
  initSentry();

  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap().catch((error) => {
  logger.error('[bootstrap] Failed to initialize app', error);
});
