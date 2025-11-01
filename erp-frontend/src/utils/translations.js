import enTranslations from '../locales/en.json';

// Simple translation helper
// In the future, this can be expanded to support multiple languages
export const t = (key, params = {}) => {
  const keys = key.split('.');
  let value = enTranslations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  // Replace parameters in the string
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }
  
  return value || key;
};

