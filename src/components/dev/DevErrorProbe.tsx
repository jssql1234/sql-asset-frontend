import { useLocation } from "react-router-dom";

export default function DevErrorProbe() {
  const { search } = useLocation();
  // Enable only in development builds
  if (!import.meta.env.DEV) return null;
  const params = new URLSearchParams(search);
  const shouldThrow = params.get("throw") === "render";
  if (shouldThrow) {
    throw new Error("Simulated render error (dev only)");
  }
  return null;
}
