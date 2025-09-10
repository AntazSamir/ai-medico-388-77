import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.847fddece3bd42038829f20decd03ab1',
  appName: 'ai-medico-388-77',
  webDir: 'dist',
  server: {
    url: "https://ai-medico-388-77.vercel.app",
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