// Utilidades para internacionalización (i18n)
import es from './locales/es.json';
import en from './locales/en.json';

export type Locale = 'es' | 'en';

const translations = {
  es,
  en,
};

export function getTranslations(locale: Locale = 'es') {
  return translations[locale];
}

export function useTranslations(locale: Locale = 'es') {
  return getTranslations(locale);
}

// Helper para obtener la URL con el locale correcto
export function getLocalizedUrl(path: string, locale: Locale = 'es'): string {
  if (locale === 'es') {
    return path;
  }
  return `/${locale}${path}`;
}

// Helper para alternar entre idiomas
export function getAlternateLocale(currentLocale: Locale): Locale {
  return currentLocale === 'es' ? 'en' : 'es';
}

// Helper para obtener la URL alternativa del idioma
export function getAlternateUrl(currentPath: string, currentLocale: Locale): string {
  const alternateLocale = getAlternateLocale(currentLocale);

  if (currentLocale === 'es') {
    // De español a inglés: agregar /en
    return `/en${currentPath}`;
  } else {
    // De inglés a español: quitar /en
    return currentPath.replace(/^\/en/, '') || '/';
  }
}
