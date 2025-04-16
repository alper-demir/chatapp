import i18n from 'i18next';
import { languages } from '../config/languages';

// Dil kodundan locale bilgisini al
const getLocaleByLanguage = (code) => {
    const lang = languages.find(lang => lang.code === code);
    return lang?.locale || 'en-US';
};

const getCurrentLocale = () => getLocaleByLanguage(i18n.language);

// Sohbet listesi için tarih formatı (relatif zaman)
export const formatConversationTime = (timestamp) => {
    const postDate = new Date(timestamp);
    const now = new Date();

    const days = i18n.t('days', { returnObjects: true });
    const locale = getCurrentLocale();

    const diffInMilliseconds = now - postDate;
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (diffInHours < 24) {
        return postDate.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const yesterdayCheck = new Date(now);
    yesterdayCheck.setDate(now.getDate() - 1);
    if (postDate.toDateString() === yesterdayCheck.toDateString()) {
        return i18n.t('yesterday');
    }

    if (diffInDays < 7) {
        return days[postDate.getDay()];
    }

    return postDate.toLocaleDateString(locale);
};

// Mesaj detayları için saat formatı
export const formatMessageTime = (timestamp) => {
    const locale = getCurrentLocale();
    return new Date(timestamp).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Sadece tarih
export const formatDate = (timestamp) => {
    const locale = getCurrentLocale();
    return new Date(timestamp).toLocaleDateString(locale);
};
