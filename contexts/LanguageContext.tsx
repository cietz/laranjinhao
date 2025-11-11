"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Language = "pt" | "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Header
    "verified.app": "Aplicativo verificado pelo Telegram",
    "top.telegram": "TOP 1 do Brasil no Telegram em conteúdo adulto.",

    // Main content
    "premium.unlock": "Torne-se usuário premium e desbloqueie mais de",
    "models.medias": "16 mil modelos e 100 mil mídias exclusivas",
    "immediate.delivery": "no site. Entrega imediata.",

    // Premium plan
    "monthly.plan": "Plano Mensal - R$ 19,90",
    "guarantee.refund": "30 dias de garantia • Reembolso total",

    // Search
    "search.models": "Pesquise aqui sua modelo...",
    "models.found": "modelo(s) encontrada(s)",

    // CTA
    "want.more": "Quer ver mais modelos?",
    "access.thousands": "Para acessar milhares de modelos exclusivas",
    "real.medias": "e mídias 100% reais mídias premium, clique",
    "button.start": "no botão abaixo para começar",

    // Features
    "features.models": "+3000 Modelos",
    "features.medias": "100 mil mídias",
    "features.hot": "Perfis Quentes",
    "features.unlimited": "Acesso Ilimitado",

    // Button
    "subscribe.premium": "🔥 Assinar Plano Premium",
    "guarantee.access": "30 dias de garantia • Acesso imediato",

    // Languages
    "language.portuguese": "Português",
    "language.english": "English",
    "language.spanish": "Español",
    likes: "likes",
  },
  en: {
    // Header
    "verified.app": "Application verified by Telegram",
    "top.telegram": "TOP 1 in Brazil on Telegram for adult content.",

    // Main content
    "premium.unlock": "Become a premium user and unlock more than",
    "models.medias": "16 thousand models and 100 thousand exclusive medias",
    "immediate.delivery": "on the site. Immediate delivery.",

    // Premium plan
    "monthly.plan": "Monthly Plan - R$ 19.90",
    "guarantee.refund": "30 days guarantee • Full refund",

    // Search
    "search.models": "Search models...",
    "models.found": "model(s) found",

    // CTA
    "want.more": "Want to see more models?",
    "access.thousands": "To access thousands of exclusive models",
    "real.medias": "and 100% real premium medias, click",
    "button.start": "the button below to start",

    // Features
    "features.models": "+3000 Models",
    "features.medias": "100k medias",
    "features.hot": "Hot Profiles",
    "features.unlimited": "Unlimited Access",

    // Button
    "subscribe.premium": "🔥 Subscribe Premium Plan",
    "guarantee.access": "30 days guarantee • Immediate access",

    // Languages
    "language.portuguese": "Português",
    "language.english": "English",
    "language.spanish": "Español",
    likes: "likes",
  },
  es: {
    // Header
    "verified.app": "Aplicación verificada por Telegram",
    "top.telegram": "TOP 1 de Brasil en Telegram en contenido adulto.",

    // Main content
    "premium.unlock": "Conviértete en usuario premium y desbloquea más de",
    "models.medias": "16 mil modelos y 100 mil medios exclusivos",
    "immediate.delivery": "en el sitio. Entrega inmediata.",

    // Premium plan
    "monthly.plan": "Plan Mensual - R$ 19.90",
    "guarantee.refund": "30 días de garantía • Reembolso total",

    // Search
    "search.models": "Buscar modelos...",
    "models.found": "modelo(s) encontrado(s)",

    // CTA
    "want.more": "¿Quieres ver más modelos?",
    "access.thousands": "Para acceder a miles de modelos exclusivos",
    "real.medias": "y medios premium 100% reales, haz clic",
    "button.start": "en el botón de abajo para comenzar",

    // Features
    "features.models": "+3000 Modelos",
    "features.medias": "100k medios",
    "features.hot": "Perfiles Calientes",
    "features.unlimited": "Acceso Ilimitado",

    // Button
    "subscribe.premium": "🔥 Suscribir Plan Premium",
    "guarantee.access": "30 días de garantía • Acceso inmediato",

    // Languages
    "language.portuguese": "Português",
    "language.english": "English",
    "language.spanish": "Español",
    likes: "me gusta",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt");

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["pt"]] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
