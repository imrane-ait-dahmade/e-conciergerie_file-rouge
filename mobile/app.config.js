/**
 * Configuration Expo dynamique : injecte les clés Google Maps depuis `.env`
 * (EXPO_PUBLIC_* chargées au démarrage par Expo).
 *
 * Prérequis natifs : après ajout ou modification des clés, exécuter `npx expo prebuild --clean`
 * (ou un build EAS) pour régénérer les projets iOS/Android.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appJson = require('./app.json');

const iosMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY;
const androidMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY;

const ios = { ...appJson.expo.ios };
if (iosMapsKey) {
  ios.config = {
    ...(ios.config ?? {}),
    googleMapsApiKey: iosMapsKey,
  };
}

const android = { ...appJson.expo.android };
if (androidMapsKey) {
  android.config = {
    ...(android.config ?? {}),
    googleMaps: {
      ...(android.config?.googleMaps ?? {}),
      apiKey: androidMapsKey,
    },
  };
}

module.exports = {
  expo: {
    ...appJson.expo,
    ios,
    android,
  },
};
