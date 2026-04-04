import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { validateEnv } from "./lib/env-validation";
import { primeSupabasePublicConfig } from "./lib/supabase-public-config";
import { initSentry } from "./lib/sentry";
import "./index.css";

async function bootstrap() {
  validateEnv();
  await primeSupabasePublicConfig();
  initSentry();

  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
