import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../app/globals.css";
import WorkshopPage from "../../app/workshop/page";

const root = document.getElementById("root");

if (!root) {
  throw new Error("ADIF Log Workshop root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <WorkshopPage />
  </StrictMode>,
);
