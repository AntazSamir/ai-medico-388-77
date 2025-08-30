import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.847fddece3bd42038829f20decd03ab1',
  appName: 'ai-medico-388-77',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: "https://847fddec-e3bd-4203-8829-f20decd03ab1.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;