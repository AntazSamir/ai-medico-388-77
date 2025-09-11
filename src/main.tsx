
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Safe service worker registration (production-only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		// Unregister ALL existing workers to avoid stale caches/blank screens
		navigator.serviceWorker.getRegistrations?.()
			.then(async (registrations) => {
				await Promise.all(
					registrations.map(async (registration) => {
						try {
							await registration.unregister();
						} catch (_) {}
					})
				);
			})
			.catch(() => {})
			.then(() => {
				return navigator.serviceWorker.register('/sw.js')
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
