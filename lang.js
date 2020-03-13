export const COOKIE_DEFAULT_LANGUAGE_SHORT_CODE = "i18nDefaultLanguageShortCode";
export const COOKIE_DEFAULT_LANGUAGE_FULL_CODE = "i18nDefaultLanguageFullCode";

export const langFromCookie = (cookie, full = false) => {
  if(cookie) {
    if(typeof cookie == "string") {
      const pattern = new RegExp(`${full ? COOKIE_DEFAULT_LANGUAGE_FULL_CODE : COOKIE_DEFAULT_LANGUAGE_SHORT_CODE}=([a-zA-Z0-9]*(-[a-zA-Z0-9]*)?)+`);
      const match = cookie.match(pattern);
      if(match) {
        return match[1];
      }
    } else {
      return cookie[full ? "COOKIE_DEFAULT_LANGUAGE_FULL_CODE" : "COOKIE_DEFAULT_LANGUAGE_SHORT_CODE"] || null;
    }
  }
  return null;
};

export const setDefaultLanguageFromCookie = (languageCode, full = false) => {
  if(typeof window === "undefined") {
    throw new Error("This method is ment to be used only client side");
  }
  document.cookie = `${full ? "COOKIE_DEFAULT_LANGUAGE_FULL_CODE" : "COOKIE_DEFAULT_LANGUAGE_SHORT_CODE"}=${languageCode}; path=/`;
};

export const languageManagerMiddleware = ({ defaultLanguageShortCode, defaultLanguageFullCode }) => (req, res, next) => {
  /**
   * At the very first visit, force default language, set the custom cookies
   * that will be used by the LanguageManager
   */
  if(!req.cookies.i18nDefaultLanguageShortCode) {
    req.lng = defaultLanguageShortCode;
    res.cookie("i18nDefaultLanguageShortCode", defaultLanguageShortCode);
    res.cookie("i18nDefaultLanguageFullCode", defaultLanguageFullCode);
  }
  return next();
};

export const lngFromReq = req => {
  if(!req.i18n) return null;
  const { allLanguages, defaultLanguage, fallbackLng } = req.i18n.options;
  const fallback = fallbackLng || defaultLanguage;
  if(!req.i18n.languages) return fallback;
  const language = req.i18n.languages.find(l => allLanguages.includes(l)) || fallback;
  return language;
};

export const lngsToLoad = (initialLng, fallbackLng, otherLanguages) => {
  const languages = [];
  if(initialLng) languages.push(initialLng);
  if(fallbackLng) {
    if(typeof fallbackLng === "string" && fallbackLng !== initialLng) languages.push(fallbackLng);
    if(Array.isArray(fallbackLng)) {
      languages.push(...fallbackLng);
    } else if(initialLng) {
      if(typeof fallbackLng[initialLng] === "string") languages.push(fallbackLng[initialLng]);
      else if(Array.isArray(fallbackLng[initialLng])) languages.push(...fallbackLng[initialLng]);
    }
    if(fallbackLng.default) languages.push(fallbackLng.default);
  }
  if(initialLng && initialLng.includes("-") && Array.isArray(otherLanguages)) {
    const [languageFromLocale] = initialLng.split("-");
    otherLanguages.forEach(otherLanguage => {
      if(otherLanguage === languageFromLocale) languages.push(otherLanguage);
    });
  }
  return languages;
};
