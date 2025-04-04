import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'prueba',
  webDir: 'dist',
  plugins: {
    Camera: {
      permissions: {
        camera: 'allow',
        photos: 'allow',  // Asegúrate de pedir también permiso para acceder a las fotos si es necesario.
      },
    },
  },
};

export default config;

