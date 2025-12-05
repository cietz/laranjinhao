"use client";
import Image from "next/image";
import Script from "next/script";
import { ExternalLink, Check, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageModal from "@/components/LanguageModal";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import modelsData from "./modelos.json";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Model {
  id: number;
  name: string;
  username: string;
  profile_image: string;
  banner_image: string;
  likes_count: string;
  verified: boolean;
  display_order: number;
}

// ===================================================================
// PROCESSAMENTO DE DADOS
// ===================================================================

// Processa os dados do JSON: ordena por display_order e mapeia para estrutura simplificada
const allModels = (modelsData as Model[])
  .sort((a, b) => a.display_order - b.display_order)
  .map((model) => ({
    id: model.id,
    name: model.name,
    username: model.username,
    image: model.profile_image,
    bg: model.banner_image,
    verified: model.verified,
    likes: model.likes_count,
  }));

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function LaranjinhaMidiasPage() {
  // Estados locais para controle da interface
  const [searchTerm, setSearchTerm] = useState(""); // Termo de pesquisa das modelos
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false); // Controle do modal de idiomas
  const [showHiddenProfile, setShowHiddenProfile] = useState(false); // Controle do card de perfil oculto
  const { t } = useLanguage(); // Hook para tradução de textos

  useTelegramWebApp(); // mantém inicialização do hook

  const getCurrentSearch = () =>
    typeof window === "undefined" ? "" : window.location.search;

  const buildSearchParams = (isTelegram: boolean) => {
    if (typeof window === "undefined") {
      return "";
    }

    const params = new URLSearchParams(getCurrentSearch());
    if (isTelegram) {
      params.set("istelegram", "true");
    } else {
      params.delete("istelegram");
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  };

  const verifyIsTelegram = () => {
    if (typeof window === "undefined") {
      return false;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("istelegram") === "true";
  };

  const getCheckoutUrl = () => {
    const isTelegram = verifyIsTelegram();
    return `/pagamento${buildSearchParams(isTelegram)}`;
  };

  const buildModelUrl = (modelId: number) => {
    if (typeof window === "undefined") {
      return `/modelos?id=${modelId}`;
    }

    const params = new URLSearchParams(window.location.search);
    params.set("id", String(modelId));

    if (verifyIsTelegram()) {
      params.set("istelegram", "true");
    } else {
      params.delete("istelegram");
    }

    return `/modelos?${params.toString()}`;
  };

  const handleModelClick = (modelId: number) => {
    window.location.href = buildModelUrl(modelId);
  };

  const handleAddToCart = () => {
    // Dispara evento AddToCart do Meta Pixel
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_name: "Plano Anual Premium",
        content_ids: ["plano_anual_premium"],
        content_type: "product",
        value: 19.9,
        currency: "BRL",
      });
    }
    // Redireciona para checkout
    window.location.href = getCheckoutUrl();
  };

  const handleUnlockAllProfiles = () => {
    // Dispara evento AddToCart do Meta Pixel
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_name: "Plano Anual Premium",
        content_ids: ["plano_anual_premium"],
        content_type: "product",
        value: 19.9,
        currency: "BRL",
      });
    }
    // Redireciona para checkout
    window.location.href = getCheckoutUrl();
  };

  const handleSubscribePremium = () => {
    // Dispara evento AddToCart do Meta Pixel
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_name: "Plano Anual Premium",
        content_ids: ["plano_anual_premium"],
        content_type: "product",
        value: 19.9,
        currency: "BRL",
      });
    }
    // Redireciona para checkout
    window.location.href = getCheckoutUrl();
  };

  const filteredModels = allModels.filter(
    (model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const video = document.getElementById(
      "paradisePlayer_1761246902292"
    ) as HTMLVideoElement | null;
    const muteOverlay = document.getElementById(
      "paradisePlayer_1761246902292MuteOverlay"
    );

    if (!video) {
      return;
    }

    video.muted = true;
    video.playbackRate = 1;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => undefined);
    }

    const handleUnmute = () => {
      video.muted = false;
      video.currentTime = 0;
      video.play();
      if (muteOverlay) {
        muteOverlay.style.opacity = "0";
        setTimeout(() => {
          muteOverlay.style.display = "none";
        }, 300);
      }
    };

    if (muteOverlay) {
      muteOverlay.addEventListener("click", handleUnmute, { once: true });
      muteOverlay.addEventListener("touchend", handleUnmute, { once: true });
    }
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-orange-950 via-orange-900 to-orange-950 text-orange-50">
        {/* =============================================================== */}
        {/* BANNER PROMOCIONAL - "TOP 1 do Brasil no Telegram" FIXO ABAIXO DO HEADER */}
        <div
          className="w-full transition-all duration-300 fixed top-[65px] z-30"
          style={{ background: "#24A1DE" }}
        >
          <div
            className="flex items-center justify-center gap-2 px-4 py-2.5 cursor-pointer"
            onClick={() => (window.location.href = getCheckoutUrl())}
          >
            <svg
              className="h-4 w-4 text-white flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23.1117 4.49449C23.4296 2.94472 21.9074 1.65683 20.4317 2.227L2.3425 9.21601C0.694517 9.85273 0.621087 12.1572 2.22518 12.8975L6.1645 14.7157L8.03849 21.2746C8.13583 21.6153 8.40618 21.8791 8.74917 21.968C9.09216 22.0568 9.45658 21.9576 9.70712 21.707L12.5938 18.8203L16.6375 21.8531C17.8113 22.7334 19.5019 22.0922 19.7967 20.6549L23.1117 4.49449ZM3.0633 11.0816L21.1525 4.0926L17.8375 20.2531L13.1 16.6999C12.7019 16.4013 12.1448 16.4409 11.7929 16.7928L10.5565 18.0292L10.928 15.9861L18.2071 8.70703C18.5614 8.35278 18.5988 7.79106 18.2947 7.39293C17.9906 6.99479 17.4389 6.88312 17.0039 7.13168L6.95124 12.876L3.0633 11.0816ZM8.17695 14.4791L8.78333 16.6015L9.01614 15.321C9.05253 15.1209 9.14908 14.9366 9.29291 14.7928L11.5128 12.573L8.17695 14.4791Z"
              />
            </svg>
            <span className="text-orange-50 text-xs font-medium text-center">
              Tops Modelos da Laranjinha Midias em conteúdo adulto
            </span>
          </div>
        </div>

        {/* =============================================================== */}
        {/* HEADER PRINCIPAL - Logo, nome da marca e botão de idioma - FIXO NO TOPO */}
        <header className="border-b border-orange-800/60 px-4 fixed top-0 z-40 h-[65px] flex items-center w-full bg-orange-950">
          <div className="flex items-center justify-between w-full">
            {/* Espaço reservado à esquerda para balanceamento */}
            <div className="w-10 h-10" />

            {/* Logo central com nome da marca Laranjinha Midias */}
            <div className="flex items-center justify-center flex-1">
              <button className="transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-center gap-[0.3rem]">
                  <div className="flex items-center justify-center">
                    <img
                      alt="Laranjinha Midias Icon"
                      width={52}
                      height={52}
                      decoding="async"
                      className="object-contain"
                      src="./laranjinha.png"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold leading-tight italic font-['Poppins',sans-serif]">
                      <span
                        className="text-orange-50"
                        style={{
                          fontFamily: "'Bubblegum Sans', cursive, sans-serif",
                        }}
                      >
                        Laranjinha Midias
                      </span>
                    </h1>
                  </div>
                </div>
              </button>
            </div>

            {/* Botão de seleção de idioma (🌐) */}
            <div className="flex items-center relative">
              <button
                onClick={() => setIsLanguageModalOpen(true)}
                className="gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10 flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="Language toggle"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-100"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* =============================================================== */}
        {/* Espaço removido pois o banner não é mais fixo */}
        {/* ÁREA PRINCIPAL DE CONTEÚDO */}
        <div className="p-4 pt-[105px]">
          {/* =============================================================== */}
          {/* CHAMADA PRINCIPAL PARA PREMIUM - Texto motivacional */}
          {/* =============================================================== */}
          <div className="text-center mb-6 pt-2 px-4">
            <p className="text-sm text-orange-100 leading-relaxed">
              {t("premium.unlock")} <br />
              <strong>{t("models.medias")}</strong>
              <br />
              {t("immediate.delivery")}
            </p>
          </div>

          {/* =============================================================== */}
          {/* VSL PLAYER */}
          {/* =============================================================== */}
          <div
            id="paradisePlayer_1761246902292Container"
            className="paradise-player-container mb-2"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1000px",
              paddingBottom: "10%",
              margin: "0 auto",
            }}
          >
            <div
              id="paradisePlayer_1761246902292Wrapper"
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "100%",
                background: "#000",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}
            >
              <video
                id="paradisePlayer_1761246902292"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                playsInline
                preload="auto"
                poster="https://t3.ftcdn.net/jpg/05/25/58/46/360_F_525584616_lKJ9605fRFWk8wxJRLZfU9lonvJzV3fa.jpg"
                onContextMenu={(e) => e.preventDefault()}
              >
                <source
                  src="https://res.cloudinary.com/dozxn19pl/video/upload/v1762726297/VSL-LARANJINHA_1_d1rbqi.mp4"
                  type="video/mp4"
                />
                Seu navegador não suporta vídeos HTML5.
              </video>

              <div
                id="paradisePlayer_1761246902292MuteOverlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#00000080",
                  cursor: "pointer",
                  zIndex: 20,
                  backdropFilter: "blur(2px)",
                }}
              >
                <div
                  id="paradisePlayer_1761246902292MuteButton"
                  className="paradise-mute-bounce"
                  style={{
                    background: "#00c27a",
                    padding:
                      "clamp(1.2rem, 5vw, 2rem) clamp(1.5rem, 7vw, 3rem)",
                    borderRadius: "12px",
                    textAlign: "center",
                    color: "white",
                    transition: "transform 0.3s ease",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                    maxWidth: "90vw",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Seu vídeo já começou!
                  </div>
                  <div style={{ marginBottom: "0.6rem" }}>
                    <img
                      src="https://i.postimg.cc/2j9d2jbv/R.png"
                      alt="Unmute"
                      style={{
                        width: "clamp(2.5rem, 8vw, 3.5rem)",
                        height: "clamp(2.5rem, 8vw, 3.5rem)",
                        filter: "brightness(0) invert(1)",
                        display: "inline-block",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(0.8rem, 2.2vw, 1rem)",
                      fontWeight: 500,
                      opacity: 0.95,
                    }}
                  >
                    Clique para ativar o som
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-lg"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
            Plano Anual R$ 19,90
          </button>

          {/* =============================================================== */}
          {/* BADGE DE GARANTIA - Indicador de reembolso do plano premium */}
          {/* =============================================================== */}
          <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 mt-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="h-2.5 w-2.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                </svg>
              </div>
              <span className="text-xs font-medium text-green-700">
                {t("guarantee.refund")}
              </span>
            </div>
          </div>

          {/* =============================================================== */}
          {/* BARRA DE PESQUISA - Sistema de busca de modelos */}
          {/* =============================================================== */}
          <div className="mb-2 mt-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-200 w-4 h-4" />
              <Input
                type="text"
                placeholder={t("search.models")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-orange-900/70 border-orange-600/50 text-orange-50 placeholder:text-white focus:border-orange-400 rounded-full"
              />
            </div>

            {/* Contador de resultados da pesquisa */}
            {searchTerm && (
              <p className="text-orange-100 text-sm mt-2">
                {filteredModels.length} {t("models.found")}
              </p>
            )}
          </div>

          {/* =============================================================== */}
          {/* BANNER PREMIUM MODELS - Indicador de modelos no plano premium */}
          {/* =============================================================== */}
          <div className="bg-orange-950/80 pt-2 py-4 border-t border-b border-orange-800/60 flex justify-center">
            <div className="border-b-2 border-orange-700/60 pb-2 px-4">
              <span className="font-medium text-orange-50">
                +3.000 Modelos no Premium
              </span>
            </div>
          </div>

          {/* =============================================================== */}
          {/* LISTA DE MODELOS - Cards das criadoras com fotos e informações */}
          {/* =============================================================== */}
          <div className="space-y-3 mb-8">
            {filteredModels.length > 0
              ? filteredModels.map((model, index) => (
                  <Card
                    key={index}
                    className="bg-green-500/50 border-green-600/40 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => handleModelClick(model.id)}
                  >
                    <div className="relative h-20 flex items-center">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${model.bg})` }}
                      />
                      <div className="relative z-10 flex items-center gap-3 p-4 w-full">
                        <div className="relative">
                          <Image
                            src={model.image || "/placeholder.svg"}
                            alt={model.name}
                            width={68}
                            height={64}
                            className="rounded-full border-2 border-orange-200/60"
                          />
                          {model.verified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-orange-50">
                              {model.name}
                            </h3>
                            {model.verified && (
                              <Check className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <p className="text-orange-100 text-sm">
                            {model.username}
                          </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-orange-100" />
                      </div>
                    </div>
                  </Card>
                ))
              : searchTerm &&
                !showHiddenProfile && (
                  /* Mensagem quando não há resultados na pesquisa */
                  <div className="text-center py-8 animate-in fade-in duration-500">
                    <div className="space-y-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-orange-50"
                          >
                            <path
                              d="M2.062 12.348a1 1 0 0 1 0-.696 
                               10.75 10.75 0 0 1 19.876 0 
                               1 1 0 0 1 0 .696 
                               10.75 10.75 0 0 1-19.876 0"
                            ></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-orange-50 mb-1">
                            Encontramos perfis ocultos!
                          </h3>
                          <p className="text-sm text-orange-100">
                            Descobrimos conteúdos ocultos relacionados à sua
                            busca desta modelo!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            {/* =============================================================== */}
            {/* CARD PERFIL OCULTO - Mostra quando não há resultados e clica em desbloquear */}
            {/* =============================================================== */}
            <Dialog>
              <DialogTitle className="hidden">{t("want.more")}</DialogTitle>
              <DialogTrigger asChild>
                <button
                  onClick={handleUnlockAllProfiles}
                  className="flex items-center gap-4 px-12 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path
                      d="M2.062 12.348a1 1 0 0 1 0-.696 
                             10.75 10.75 0 0 1 19.876 0 
                             1 1 0 0 1 0 .696 
                             10.75 10.75 0 0 1-19.876 0"
                    ></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Desbloquear Todos os Perfis
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  </svg>
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 max-w-sm w-full bg-orange-950/95 rounded-xl border border-orange-700/40 shadow-lg">
                <div className="relative overflow-hidden bg-orange-950/95 rounded-xl">
                  {/* Banner */}
                  <div className="relative h-32 w-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-green-600 blur-[15px] brightness-75 scale-[1.2]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-orange-50">
                        <svg
                          className="w-8 h-8 mx-auto mb-2 drop-shadow-lg"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <p className="text-xs font-medium drop-shadow-lg">
                          Perfil Oculto
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="absolute top-24 left-6 z-10">
                    <div className="h-16 w-16 rounded-full border-4 border-orange-200/70 overflow-hidden relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center blur-md brightness-75 scale-[1.1]"
                        style={{
                          backgroundImage:
                            "url('https://snewbnpytfvvjerythvw.supabase.co/storage/v1/object/public/model-images/profile_1748415578476_lb2fzagv_cropped_imagem_2025_05_28.jpg')",
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-green-600/30"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-orange-50 drop-shadow"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="pt-10 px-6 pb-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-orange-50 capitalize">
                          {searchTerm}
                        </h2>
                        <svg
                          className="w-[18px] h-[18px] text-[#F58673]"
                          fill="currentColor"
                          viewBox="0 0 512 512"
                        >
                          <path d="M190.6 71.4C203 47.9 227.7 32 256 32s53 15.9 65.4 39.4c3.6 6.8 11.5 10.1 18.8 7.8c25.4-7.8 54.1-1.6 74.1 18.4s26.2 48.7 18.4 74.1c-2.3 7.3 1 15.2 7.8 18.8C464.1 203 480 227.7 480 256s-15.9 53-39.4 65.4c-6.8 3.6-10.1 11.5-7.8 18.8c7.8 25.4 1.6 54.1-18.4 74.1s-48.7 26.2-74.1 18.4c-7.3-2.3-15.2 1-18.8 7.8C309 464.1 284.3 480 256 480s-53-15.9-65.4-39.4c-3.6-6.8-11.5-10.1-18.8-7.8c-25.4 7.8-54.1 1.6-74.1-18.4s-26.2-48.7-18.4-74.1c2.3-7.3-1-15.2-7.8-18.8C47.9 309 32 284.3 32 256s15.9-53 39.4-65.4c6.8-3.6 10.1-11.5 7.8-18.8c-7.8-25.4-1.6-54.1 18.4-74.1s48.7-26.2 74.1-18.4c7.3 2.3 15.2-1 18.8-7.8zM363.3 203.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L224 297.4l-52.7-52.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l64 64c6.2 6.2 16.4 6.2 22.6 0l128-128z" />
                        </svg>
                      </div>
                      <p className="text-sm text-orange-100 mb-3">
                        @{searchTerm.toLowerCase()}
                      </p>

                      <div className="bg-green-900 border border-green-600 rounded-lg p-4 text-sm text-green-100">
                        <strong>Perfil Exclusivo Encontrado!</strong>
                        <br />
                        Encontramos um perfil oculto com{" "}
                        <strong>vários conteúdos</strong> relacionados ao termo
                        "<strong>{searchTerm}</strong>".
                        <br />
                        <strong>Este perfil contém conteudos exclusivos</strong>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleUnlockAllProfiles}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:scale-105 transition-all shadow-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                          <path d="M12 18V6" />
                        </svg>
                        Desbloquear Todos os Perfis
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M15 3h6v6" />
                          <path d="M10 14 21 3" />
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setShowHiddenProfile(false)}
                        className="px-4 py-2 text-sm text-green-200 rounded-lg hover:bg-green-800/60 transition"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* =============================================================== */}
          {/* CARD PREMIUM FINAL - Última chamada para assinatura premium */}
          {/* =============================================================== */}
          <div className="mt-8 mb-6">
            <div className="rounded-lg border border-orange-700/40 bg-gradient-to-br from-orange-950 via-orange-900 to-orange-950 text-orange-50 overflow-hidden shadow-xl">
              <div className="relative p-6">
                {/* Background overlays */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600"></div>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  ></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 text-orange-50"
                      aria-hidden="true"
                    >
                      <rect
                        width="18"
                        height="11"
                        x="3"
                        y="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-orange-50 mb-2">
                    Quer ver mais modelos?
                  </h3>

                  <p className="text-orange-100 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                    Para acessar <strong>milhares de modelos exclusivas</strong>{" "}
                    e <strong>mais de 100 mil mídias premium</strong>, assine
                    nosso plano completo!
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6 text-xs max-w-sm mx-auto">
                    {[
                      "+3000 Modelos",
                      "+100 Mil Mídias",
                      "Perfis Ocultos",
                      "Acesso Ilimitado",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-orange-100"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubscribePremium}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                      <path d="M12 18V6"></path>
                    </svg>
                    Assinar Plano Premium
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14 21 3"></path>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    </svg>
                  </button>

                  <p className="text-xs text-orange-200/80 mt-3">
                    30 dias de garantia • Acesso imediato
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* MODAL DE SELEÇÃO DE IDIOMAS - Componente para trocar idioma */}
        {/* =============================================================== */}
        <LanguageModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
        />

        {/* =============================================================== */}
        {/* SCRIPTS ADICIONAIS - Meta Pixel */}
        {/* =============================================================== */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '840886561712553');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=840886561712553&ev=PageView&noscript=1"
          />
        </noscript>

        {/* Paradise Player Styles */}
        <style jsx global>{`
          #paradisePlayer_1761246902292::-webkit-media-controls,
          #paradisePlayer_1761246902292::-webkit-media-controls-enclosure {
            display: none !important;
          }

          @keyframes paradise-fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes paradise-mute-bounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .paradise-player-container * {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </div>
    </>
  );
}
