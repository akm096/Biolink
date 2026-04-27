import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  en: {
    language: 'Language',
    admin: 'Admin',
    dashboard: 'Dashboard',
    myProfile: 'My Profile',
    logout: 'Logout',
    login: 'Login',
    getStarted: 'Get Started',
    welcomeBack: 'Welcome Back',
    signInAccount: 'Sign in to your account',
    usernameOrEmail: 'Username or Email',
    enterUsernameOrEmail: 'Enter username or email',
    password: 'Password',
    enterPassword: 'Enter password',
    signingIn: 'Signing in...',
    signIn: 'Sign In',
    noAccount: "Don't have an account?",
    createOne: 'Create one',
    demoAccount: 'Demo account',
    createAccount: 'Create Account',
    setupProfile: 'Set up your bio link profile in seconds',
    username: 'Username',
    profileUrlHelp: 'This will be your profile URL:',
    email: 'Email',
    minimumPassword: 'Minimum 6 characters',
    creatingAccount: 'Creating account...',
    alreadyAccount: 'Already have an account?',
    pleaseFill: 'Please fill in all fields',
    passwordMin: 'Password must be at least 6 characters',
    accountCreated: 'Account created! Welcome to BioPlatform',
    registrationFailed: 'Registration failed',
    welcomeToast: 'Welcome back!',
    loginFailed: 'Login failed',
    quickAddSocialLinks: 'Quick Add Social Links',
    fullLink: 'Full Link',
    add: 'Add',
    discordNick: 'Discord Nick',
    manageProfile: 'Manage your profile and links',
    copyUrl: 'Copy URL',
    preview: 'Preview',
    profile: 'Profile',
    links: 'Links',
    theme: 'Theme',
    stats: 'Stats',
    addLink: 'Add Link',
    quickAddSocial: 'Quick Add Social',
  },
  tr: {
    language: 'Dil',
    admin: 'Admin',
    dashboard: 'Panel',
    myProfile: 'Profilim',
    logout: 'Cikis',
    login: 'Giris',
    getStarted: 'Basla',
    welcomeBack: 'Tekrar Hos Geldin',
    signInAccount: 'Hesabina giris yap',
    usernameOrEmail: 'Kullanici adi veya e-posta',
    enterUsernameOrEmail: 'Kullanici adi veya e-posta gir',
    password: 'Sifre',
    enterPassword: 'Sifreni gir',
    signingIn: 'Giris yapiliyor...',
    signIn: 'Giris Yap',
    noAccount: 'Hesabin yok mu?',
    createOne: 'Hesap olustur',
    demoAccount: 'Demo hesap',
    createAccount: 'Hesap Olustur',
    setupProfile: 'Bio link profilini saniyeler icinde hazirla',
    username: 'Kullanici adi',
    profileUrlHelp: 'Profil adresin:',
    email: 'E-posta',
    minimumPassword: 'En az 6 karakter',
    creatingAccount: 'Hesap olusturuluyor...',
    alreadyAccount: 'Zaten hesabin var mi?',
    pleaseFill: 'Lutfen tum alanlari doldur',
    passwordMin: 'Sifre en az 6 karakter olmali',
    accountCreated: 'Hesap olusturuldu! BioPlatforma hos geldin',
    registrationFailed: 'Kayit basarisiz',
    welcomeToast: 'Tekrar hos geldin!',
    loginFailed: 'Giris basarisiz',
    quickAddSocialLinks: 'Sosyal Linkleri Hizli Ekle',
    fullLink: 'Tam Link',
    add: 'Ekle',
    discordNick: 'Discord Adi',
    manageProfile: 'Profilini ve linklerini yonet',
    copyUrl: 'URL Kopyala',
    preview: 'Onizle',
    profile: 'Profil',
    links: 'Linkler',
    theme: 'Tema',
    stats: 'Istatistikler',
    addLink: 'Link Ekle',
    quickAddSocial: 'Sosyal Hizli Ekle',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('bio_language') || 'en');

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage(nextLanguage) {
      const safeLanguage = nextLanguage === 'tr' ? 'tr' : 'en';
      localStorage.setItem('bio_language', safeLanguage);
      setLanguage(safeLanguage);
      document.documentElement.lang = safeLanguage;
    },
    t(key) {
      return translations[language]?.[key] || translations.en[key] || key;
    },
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
