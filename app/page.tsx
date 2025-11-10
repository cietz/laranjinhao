"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PresellPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  // Evita uso de `window` durante SSR: calcula flag apenas no cliente
  const [isTelegram, setIsTelegram] = useState(false);
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      setIsTelegram(urlParams.get("istelegram") === "true");
    } catch (e) {
      // se window não existir ou outra falha, mantém false
      setIsTelegram(false);
    }
  }, []);

  // Mostra loading durante redirecionamento
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900 flex items-center justify-center">
        <div className="text-orange-50 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-200 mx-auto mb-4"></div>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Telegram Web App Integration */}
      <Script id="telegram-webapp-init" strategy="afterInteractive">
        {`
          if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            // Hide main button on landing page
            tg.MainButton.hide();
            
            // Set theme colors
            document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color || '#000000');
            document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color || '#ffffff');
          }
        `}
      </Script>

      {/* UTM Handler Script */}
      <Script
        src="https://cdn.jsdelivr.net/gh/xTracky/static/utm-handler.js"
        data-token="3f0817fd-b04a-49a5-972c-416d223ac189"
        data-click-id-param="click_id"
      />

      {/* UTMify Script */}
      <Script
        src="https://cdn.utmify.com.br/scripts/utms/latest.js"
        data-utmify-prevent-xcod-sck
        data-utmify-prevent-subids
        strategy="afterInteractive"
        async
        defer
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 flex items-center justify-center p-4 text-orange-900">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Logo/Brand */}
          <div className="space-y-2">
            <h1
              className="font-bold text-orange-900 tracking-tight"
              style={{
                fontFamily: "'Bubblegum Sans', cursive, sans-serif",
                fontSize: "36px",
                fontStyle: "italic",
              }}
            >
              🍊 LARANJINHA MÍDIAS
            </h1>
            <p className="text-orange-800 text-lg md:text-xl font-semibold">
              ACESSO COMPLETO PAGANDO UMA ÚNICA VEZ
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-4 text-left bg-white/50 p-6 rounded-2xl border border-orange-200 shadow-md">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-800 font-medium">
                🔥 +3.000 MODELOS EXCLUSIVAS
              </li>
              <li className="flex items-center gap-2 text-gray-800 font-medium">
                🔥 +100.000 MÍDIAS PREMIUM
              </li>
              <li className="flex items-center gap-2 text-gray-800">
                ✅ Perfis verificados
              </li>
              <li className="flex items-center gap-2 text-gray-800">
                ✅ Acesso imediato
              </li>
              <li className="flex items-center gap-2 text-gray-800">
                ✅ Tudo organizado por nome
              </li>
              <li className="flex items-center gap-2 text-gray-800">
                ✅ Vazados do Brasil vazam PRIMEIRO AQUI
              </li>
              <li className="flex items-center gap-2 text-gray-800">
                ✅ OnlyF4ns, CloseFriends, Priv4cy
              </li>
              <li className="flex items-center gap-2 text-gray-800">
                ✅ Incestos, fetiches e + 🔞
              </li>
              <li className="flex items-center gap-2 text-gray-800">
                📦 +30 categorias
              </li>
              <li className="flex items-center gap-2 text-gray-800">
                ♻️ Atualizações diárias
              </li>
            </ul>
            <div className="text-sm text-center text-orange-800 bg-orange-100 p-3 rounded-lg">
              <p>+18 garotas jovens, MILFs, orgias, flagrantes</p>
              <p>Patricinhas, faveladinhas, famosas e amadoras</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full px-12 py-6 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => {
                const currentParams = new URLSearchParams(
                  window.location.search
                );
                if (isTelegram) {
                  currentParams.set("istelegram", "true");
                }
                const queryString = currentParams.toString();
                window.location.href = `/inicio${
                  queryString ? `?${queryString}` : ""
                }`;
              }}
            >
              🚪 ENTRADA AUTOMÁTICA
            </Button>

            {/* Guarantee badge */}
            <div className="text-center text-orange-800 space-y-2">
              <p className="font-semibold">Qual famosa você quer?</p>
              <p className="text-sm">
                MC Mirella // Virginia // Mel Maia // Jade Picon
              </p>
              <p className="font-bold text-lg text-orange-900">
                CLICA E LIBERA TUDO AGORA 🍊
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
