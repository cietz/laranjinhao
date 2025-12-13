/**
 * Lib para integração com UTMify
 * Envia dados de transações para tracking
 * Documentação: https://api.utmify.com.br/api-credentials/orders
 */

/**
 * Formata data para o padrão UTMify: YYYY-MM-DD HH:MM:SS (UTC)
 */
export function formatDateForUTMify(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const seconds = String(d.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export interface UTMifyPayload {
  orderId: string;
  platform: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  approvedDate: string | null;
  refundedAt: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string;
    country: string;
    ip: string | null;
  };
  products: Array<{
    id: string;
    name: string;
    planId: string | null;
    planName: string | null;
    quantity: number;
    priceInCents: number;
  }>;
  trackingParameters: {
    src: string | null;
    sck: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
    utm_medium: string | null;
    utm_content: string | null;
    utm_term: string | null;
  };
  commission: {
    totalPriceInCents: number;
    gatewayFeeInCents: number;
    userCommissionInCents: number;
  };
  isTest: boolean;
}

// Endpoint oficial conforme documentação UTMify
const UTMIFY_API_URL = "https://api.utmify.com.br/api-credentials/orders";
const UTMIFY_API_TOKEN =
  process.env.UTMIFY_API_TOKEN || "693753db44ffe041b5456968";

/**
 * Envia payload para UTMify
 */
export async function sendToUTMify(
  payload: UTMifyPayload
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    console.log("[UTMify] Enviando para API:", {
      orderId: payload.orderId,
      status: payload.status,
    });

    const response = await fetch(UTMIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": UTMIFY_API_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[UTMify] Erro na API:", response.status, errorText);
      return {
        success: false,
        error: `UTMify API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log("[UTMify] Resposta da API:", data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[UTMify] Erro ao enviar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Mapeia dados da Marcha API para formato UTMify
 */
export function mapMarchaToUTMify(marchaData: any): UTMifyPayload {
  // Map Marcha status to UTMify status
  const statusMap: Record<string, string> = {
    waiting_payment: "waiting_payment",
    pending: "waiting_payment",
    approved: "paid",
    paid: "paid",
    refused: "refused",
    cancelled: "refused",
    refunded: "refunded",
    chargeback: "chargedback",
    in_protest: "refused",
  };

  const status = statusMap[marchaData.status] || marchaData.status;

  return {
    orderId: String(marchaData.id),
    platform: "Laranjinha",
    paymentMethod: marchaData.paymentMethod || "pix",
    status,
    createdAt: marchaData.createdAt
      ? formatDateForUTMify(marchaData.createdAt)
      : formatDateForUTMify(new Date()),
    approvedDate: marchaData.paidAt
      ? formatDateForUTMify(marchaData.paidAt)
      : null,
    refundedAt:
      marchaData.status === "refunded" && marchaData.updatedAt
        ? formatDateForUTMify(marchaData.updatedAt)
        : null,
    customer: {
      name: marchaData.customer?.name || "",
      email: marchaData.customer?.email || "",
      phone: marchaData.customer?.phone || null,
      document: marchaData.customer?.document?.number || null,
      country: "BR",
      ip: marchaData.ip || null,
    },
    products: marchaData.items?.map((item: any) => ({
      id: item.externalRef || "plano-premium",
      name: item.title || "Plano Premium",
      planId: null,
      planName: null,
      quantity: item.quantity || 1,
      priceInCents: item.unitPrice || marchaData.amount,
    })) || [
      {
        id: "plano-premium",
        name: "Plano Premium Laranjinha",
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: marchaData.amount,
      },
    ],
    trackingParameters: {
      src: null,
      sck: null,
      utm_source: null,
      utm_campaign: null,
      utm_medium: null,
      utm_content: null,
      utm_term: null,
    },
    commission: {
      totalPriceInCents: marchaData.amount,
      gatewayFeeInCents:
        marchaData.fee?.estimatedFee || Math.round(marchaData.amount * 0.03),
      userCommissionInCents:
        marchaData.fee?.netAmount || Math.round(marchaData.amount * 0.97),
    },
    isTest: false,
  };
}
