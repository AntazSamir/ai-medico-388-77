
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Safe service worker registration (production-only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister old workers first to avoid stale caches/blank screens
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((r) => {
        // Keep the same script, just ensure it's fresh
        if (!r.active || (r.active && r.active.scriptURL.endsWith('/sw.js'))) return;
        r.unregister().catch(() => {});
      });
    }).finally(() => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
