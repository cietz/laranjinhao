/**
 * Hook/Utility para enviar evento de PIX Gerado para UTMify
 * Usado quando um código PIX é gerado para rastrear a intenção de pagamento
 */

interface PixGeneratedProduct {
  id: string;
  name: string;
  priceInCents: number;
  quantity: number;
}

interface PixGeneratedCustomer {
  name: string;
  email: string;
  phone: string;
  document: string;
}

interface PixGeneratedCommission {
  totalPriceInCents: number;
  gatewayFeeInCents: number;
  userCommissionInCents: number;
}

interface PixGeneratedPayload {
  orderId: string;
  customer: PixGeneratedCustomer;
  products: PixGeneratedProduct[];
  commission: PixGeneratedCommission;
}

/**
 * Formata data para o padrão UTMify: YYYY-MM-DD HH:MM:SS (UTC)
 */
function formatDateForUTMify(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Envia evento de PIX gerado para UTMify
 * Este evento é disparado quando o código PIX é gerado, antes do pagamento ser confirmado
 */
export async function sendPixGeneratedToUTMify(
  payload: PixGeneratedPayload
): Promise<void> {
  try {
    // Verifica se estamos no cliente
    if (typeof window === "undefined") {
      console.log("[UTMify] Ignorando envio - não está no cliente");
      return;
    }

    // Captura UTMs da URL atual
    const urlParams = new URLSearchParams(window.location.search);

    const trackingParams = {
      src: urlParams.get("src") || null,
      sck: urlParams.get("sck") || urlParams.get("fbclid") || null,
      utm_source: urlParams.get("utm_source") || null,
      utm_campaign: urlParams.get("utm_campaign") || null,
      utm_medium: urlParams.get("utm_medium") || null,
      utm_content: urlParams.get("utm_content") || null,
      utm_term: urlParams.get("utm_term") || null,
    };

    // Monta o payload para UTMify conforme documentação oficial
    const utmifyPayload = {
      orderId: payload.orderId,
      platform: "Laranjinha",
      paymentMethod: "pix",
      status: "waiting_payment", // PIX gerado, aguardando pagamento
      createdAt: formatDateForUTMify(new Date()), // Formato: YYYY-MM-DD HH:MM:SS (UTC)
      approvedDate: null,
      refundedAt: null,
      customer: {
        name: payload.customer.name,
        email: payload.customer.email,
        phone: payload.customer.phone || null,
        document: payload.customer.document || null,
        country: "BR",
        ip: null, // IP será capturado pelo servidor se necessário
      },
      products: payload.products.map((p) => ({
        id: p.id,
        name: p.name,
        planId: null,
        planName: null,
        quantity: p.quantity,
        priceInCents: p.priceInCents,
      })),
      trackingParameters: trackingParams,
      commission: payload.commission,
      isTest: false,
    };

    console.log("[UTMify] Enviando PIX gerado:", utmifyPayload);

    // Envia para o endpoint UTMify (conforme documentação oficial)
    const response = await fetch(
      "https://api.utmify.com.br/api-credentials/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-token": "693753db44ffe041b5456968", // Token UTMify
        },
        body: JSON.stringify(utmifyPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`UTMify API error: ${response.status} - ${errorText}`);
    }

    console.log("[UTMify] PIX gerado enviado com sucesso!");
  } catch (error) {
    console.error("[UTMify] Erro ao enviar PIX gerado:", error);
    // Não propaga o erro para não bloquear o fluxo principal
  }
}

export default sendPixGeneratedToUTMify;
