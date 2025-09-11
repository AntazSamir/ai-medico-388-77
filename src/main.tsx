
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Disable service worker completely and clean up any existing ones
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
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
			.catch(() => {});
	});
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
