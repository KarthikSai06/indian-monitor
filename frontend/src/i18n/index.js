import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Minimal i18n setup — returns the key as fallback (English passthrough)
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          sections: {
            incidentMap: 'India Incident Map',
            viewAll: 'View All',
            news: 'News',
            markets: 'Markets',
            weather: 'Weather',
            festivals: 'Festivals',
          },
          common: {
            alert: 'ALERT',
            warning: 'WARNING',
            safe: 'SAFE',
            alerts: 'alerts',
            warnings: 'warnings',
            loading: 'Loading…',
            error: 'Error',
          },
        },
      },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
