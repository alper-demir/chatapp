import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { languages } from './config/languages';

const supportedLngs = languages.map((lang) => lang.code);

i18n
    .use(Backend)
    .use(LanguageDetector) // Tarayıcı dilini algılar
    .use(initReactI18next)
    .init({
        fallbackLng: 'tr', // Varsayılan dil
        supportedLngs, // Desteklenen diller
        backend: {
            loadPath: '/locales/{{lng}}/translation.json', // Dil dosyalarının yolu
        },
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
        }
    });

export default i18n;