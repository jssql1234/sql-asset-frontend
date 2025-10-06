import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App";
import './styles/tableColumnVisibilityStyles'
import './styles/inputStyles'
import './styles/textAreaStyles'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
