import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createAppError } from "@/types/errors";
import { logError, logInfo } from "@/utils/logger";

/**
 * Component that triggers errors based on URL query parameters for testing purposes.
 * This component should only be used in development/testing environments.
 * 
 * Query parameters:
 * - ?throw=render : Triggers a render error
 * - ?throw=fatal : Triggers a fatal render error
 * - ?throw=chunk : Triggers a chunk load error
 * - ?testLog=redact : Tests sensitive field redaction
 * - ?testLog=info : Tests info logging
 */
export default function DevErrorProbe() {
  const { search } = useLocation();
  // Enable only in development builds
  if (!import.meta.env.DEV) return null;
  
  const params = new URLSearchParams(search);
  const throwType = params.get("throw");
  const testLog = params.get("testLog");

  // Test logging scenarios
  useEffect(() => {
    if (testLog === "redact") {
      // Test 6: Redaction of sensitive fields
      logError(new Error("Test redaction error"), undefined, {
        scope: "test",
        component: "DevErrorProbe",
        token: "secret-token-12345",
        password: "my-password",
        apiKey: "api-key-xyz",
        secret: "super-secret",
        normalField: "this-should-be-visible",
      });
    }

    if (testLog === "info") {
      // Test 8: Production gating for info logs
      logInfo("Test info log - should only appear in dev", {
        scope: "test",
        component: "DevErrorProbe",
      });
    }
  }, [testLog]);

  // Test render errors
  if (throwType === "render") {
    throw new Error("Simulated render error (dev only)");
  }

  if (throwType === "fatal") {
    throw createAppError(
      "Test fatal error triggered by ?throw=fatal",
      "UNKNOWN",
      "fatal"
    );
  }

  if (throwType === "chunk") {
    // Simulate chunk load error
    throw new Error("Loading chunk 123 failed. (error: https://example.com/chunk-123.js)");
  }

  return null;
}
