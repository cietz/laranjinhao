"use client";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const languages = [
    { code: "pt" as const, name: t("language.portuguese"), flag: "🇧🇷" },
    { code: "en" as const, name: t("language.english"), flag: "🇺🇸" },
    { code: "es" as const, name: t("language.spanish"), flag: "🇪🇸" },
  ];

  const handleLanguageChange = (langCode: "pt" | "en" | "es") => {
    setLanguage(langCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">
              🌐 Idioma / Language
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
              aria-label="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        {/* Language Options */}
        <div className="p-4 space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                transition-all duration-200 hover:bg-gray-50
                ${
                  language === lang.code
                    ? "bg-gradient-to-r from-green-50 to-green-50 border-2 border-green-200"
                    : "border-2 border-transparent hover:border-gray-100"
                }
              `}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1">
                <span className="text-gray-900 font-medium">{lang.name}</span>{" "}
                {language === lang.code && (
                  <div className="flex items-center gap-1 mt-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-500"
                    >
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                    <span className="text-sm text-green-600 font-medium">
                      {language === "pt"
                        ? "Selecionado"
                        : language === "en"
                        ? "Selected"
                        : "Seleccionado"}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>{" "}
        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-500 text-center">
            {language === "pt"
              ? "O idioma será aplicado em todo o site"
              : language === "en"
              ? "Language will be applied to the entire site"
              : "El idioma se aplicará a todo el sitio"}
          </p>
        </div>
      </div>
    </div>
  );
}
