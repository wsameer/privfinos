import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

import "./globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("No root element found");

createRoot(root).render(
  <StrictMode>
    <>
      <App />
      <Toaster />
    </>
  </StrictMode>,
);
