import { NextResponse } from "next/server";

export function middleware(req) {
  const ua = req.headers.get("user-agent")?.toLowerCase() || "";
  const referer = req.headers.get("referer")?.toLowerCase() || "";
  const url = req.nextUrl;

  // Página de bloqueio - nunca redireciona de lá
  if (url.pathname === "/blog") {
    return NextResponse.redirect(
      new URL("https://ephemeral-capybara-7424d5.netlify.app/", req.url)
    );
  }

  // Verifica se é acesso do Telegram Mini App
  const isTelegramApp = url.searchParams.get("istelegram") === "true";
  const hasTelegramCookie = req.cookies.get("telegram_validated");

  // Se for do Telegram, permite acesso direto
  if (isTelegramApp || hasTelegramCookie) {
    const response = NextResponse.next();
    // Cria cookie para manter sessão do Telegram
    if (isTelegramApp) {
      response.cookies.set("telegram_validated", "true", {
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        httpOnly: true,
        sameSite: "lax",
      });
    }
    return response;
  }

  const bots = [
    "facebookexternalhit",
    "facebot",
    "twitterbot",
    "slackbot",
    "whatsapp",
    "telegrambot",
    "linkedinbot",
    "googlebot",
    "bingbot",
    "adsbot",
    "crawler",
    "bot",
  ];

  const isBot = bots.some((bot) => ua.includes(bot));

  const isMobile =
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);

  // Verifica UTMs na URL
  const fbclid = url.searchParams.get("fbclid");
  const utmSource = url.searchParams.get("utm_source");
  const utmMedium = url.searchParams.get("utm_medium");
  const utmCampaign = url.searchParams.get("utm_campaign");

  // Verifica se tem cookie de validação (usuário já passou pela validação)
  const hasValidationCookie = req.cookies.get("utm_validated");

  const isFromFacebook =
    fbclid !== null ||
    utmSource === "facebook" ||
    referer.includes("facebook.com");

  const isAdTraffic =
    (fbclid !== null || utmMedium === "paid" || utmMedium === "cpc") &&
    utmCampaign !== null;

  // Verifica se passou por todas as validações
  const isValid = !isBot && isMobile && isFromFacebook && isAdTraffic;

  // Bloqueia bots
  if (isBot) {
    return NextResponse.redirect(
      new URL("https://ephemeral-capybara-7424d5.netlify.app/", req.url)
    );
  }

  // Bloqueia desktop
  if (!isMobile) {
    return NextResponse.redirect(
      new URL("https://ephemeral-capybara-7424d5.netlify.app/", req.url)
    );
  }

  // Bloqueia se não vier com UTMs do Facebook E não tiver cookie de validação
  if (!isValid && !hasValidationCookie) {
    return NextResponse.redirect(
      new URL("https://ephemeral-capybara-7424d5.netlify.app/", req.url)
    );
  }

  // Se passou nas validações, cria cookie e permite acesso
  if (isValid) {
    const response = NextResponse.next();
    // Cookie válido por 24 horas
    response.cookies.set("utm_validated", "true", {
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  // Se tem cookie válido, permite acesso
  return NextResponse.next();
}

export const config = {
  // Protege TODAS as páginas exceto /blog
  matcher: ["/((?!blog|api|_next/static|_next/image|favicon.ico).*)"],
};
