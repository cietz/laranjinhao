import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Configurações do Meta Pixel
const META_PIXEL_ID = 840886561712553;
const META_ACCESS_TOKEN =
  "EAAJ4XUEZAyZCYBPZBgig1s8CASj8ZC8JL0LRCCZBU35ZBEeyVZC0HyW3jjM6uZAQeYOe9PS87P47IuEZBSxiYYQMNmrDTsYCo7ecLhk4S0h9dSTtQbtnLfXxjmhmMkkDAwJBid47d8ZCmIpSKwUoYRDeqKHT56KVVDVx0tzevcX58CoK4MZCtkesVf6VvyAjiZCZBdAZDZD";
const META_API_VERSION = "v18.0";

// Interface para webhook da Marcha API (conforme documentação oficial)
interface MarchaWebhookPayload {
  id: number;
  type: "transaction";
  objectId: string;
  url: string;
  data: {
    id: number;
    amount: number;
    refundedAmount: number;
    companyId: number;
    installments: number;
    paymentMethod: "pix" | "boleto" | "credit_card";
    status:
      | "waiting_payment"
      | "pending"
      | "approved"
      | "refused"
      | "in_protest"
      | "refunded"
      | "paid"
      | "cancelled"
      | "chargeback";
    postbackUrl: string;
    metadata: string | null;
    traceable: boolean;
    secureId: string;
    secureUrl: string;
    createdAt: string;
    updatedAt: string;
    paidAt: string | null;
    ip: string | null;
    externalRef: string | null;
    customer: {
      id: number;
      externalRef: string | null;
      name: string;
      email: string;
      phone: string;
      birthdate: string | null;
      createdAt: string;
      document: {
        number: string;
        type: "cpf" | "cnpj";
      };
      address: {
        street: string;
        streetNumber: string;
        complement: string | null;
        zipCode: string;
        neighborhood: string;
        city: string;
        state: string;
        country: string;
      } | null;
    };
    card: {
      id: number;
      brand: string;
      holderName: string;
      lastDigits: string;
      expirationMonth: number;
      expirationYear: number;
      reusable: boolean;
      createdAt: string;
    } | null;
    boleto: {
      barcode: string;
      digitableLine: string;
      expirationDate: string;
      url: string;
    } | null;
    pix: {
      qrcode: string;
      qrcodeText: string;
      expirationDate: string;
      end2EndId: string | null;
      receiptUrl: string | null;
    } | null;
    shipping: {
      street: string;
      streetNumber: string;
      complement: string | null;
      zipCode: string;
      neighborhood: string;
      city: string;
      state: string;
      country: string;
    } | null;
    refusedReason: {
      acquirerCode: string;
      description: string;
    } | null;
    items: Array<{
      externalRef: string | null;
      title: string;
      unitPrice: number;
      quantity: number;
      tangible: boolean;
    }>;
    splits: Array<{
      recipientId: number;
      amount: number;
      netAmount: number;
    }>;
    refunds: Array<{
      id: number;
      amount: number;
      createdAt: string;
    }>;
    delivery: any | null;
    fee: {
      fixedAmount: number;
      spreadPercentage: number;
      estimatedFee: number;
      netAmount: number;
    };
    threeDS: {
      redirectUrl: string;
      returnUrl: string;
      token: string;
    } | null;
  };
}

// Função para fazer hash SHA256 (Meta requer dados pessoais hasheados)
function hashSHA256(value: string): string {
  if (!value) return "";
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

// Função para normalizar telefone (remover caracteres especiais)
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Função para enviar evento para Meta Conversion API
async function sendToMetaConversionAPI(marchaPayload: MarchaWebhookPayload) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    console.error("Meta Pixel ID ou Access Token não configurados");
    return { success: false, error: "Meta credentials not configured" };
  }

  const data = marchaPayload.data;
  const transactionId = data.id;
  const amount = data.amount;
  const customerEmail = data.customer.email;
  const customerPhone = data.customer.phone;
  const customerName = data.customer.name;
  const timestamp = data.paidAt || data.updatedAt || data.createdAt;

  // Parse metadata (é uma string JSON conforme documentação)
  let parsedMetadata: any = {};
  if (data.metadata) {
    try {
      parsedMetadata =
        typeof data.metadata === "string"
          ? JSON.parse(data.metadata)
          : data.metadata;
    } catch (e) {
      console.error("Erro ao parsear metadata:", e);
    }
  }
  const tracking = parsedMetadata?.tracking || {};

  const eventTime = Math.floor(new Date(timestamp).getTime() / 1000);
  const currentTime = Math.floor(Date.now() / 1000);

  // Preparar dados do usuário (hasheados conforme exigência da Meta)
  const userData: any = {
    em: hashSHA256(customerEmail),
    ph: hashSHA256(normalizePhone(customerPhone)),
    fn: hashSHA256(customerName.split(" ")[0] || ""),
    ln: hashSHA256(customerName.split(" ").slice(1).join(" ") || ""),
    client_ip_address: data.ip || "",
    client_user_agent: "",
    fbc: tracking?.sck || "",
    fbp: "",
  };

  // Preparar dados customizados
  const customData: any = {
    currency: "BRL",
    value: (amount / 100).toFixed(2),
    content_type: "product",
    transaction_id: transactionId,
    payment_method: data.paymentMethod,
  };

  // Adicionar dados de rastreamento se disponíveis
  if (tracking) {
    if (tracking.utm_source) customData.utm_source = tracking.utm_source;
    if (tracking.utm_campaign) customData.utm_campaign = tracking.utm_campaign;
    if (tracking.utm_medium) customData.utm_medium = tracking.utm_medium;
    if (tracking.utm_content) customData.utm_content = tracking.utm_content;
    if (tracking.utm_term) customData.utm_term = tracking.utm_term;
  }

  // Preparar evento
  const event = {
    event_name: "Purchase",
    event_time: eventTime > 0 ? eventTime : currentTime,
    event_source_url: tracking?.src || "",
    action_source: "website",
    user_data: userData,
    custom_data: customData,
  };

  // Montar payload para Meta API
  const metaPayload = {
    data: [event],
    test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
  };

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;

    console.log("Enviando evento para Meta Conversion API:", {
      transaction_id: transactionId,
      amount: amount,
      event_time: eventTime,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metaPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Erro ao enviar para Meta API:", responseData);
      return {
        success: false,
        error: responseData,
        status: response.status,
      };
    }

    console.log("Evento enviado com sucesso para Meta API:", responseData);
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("Erro ao enviar para Meta Conversion API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Webhook recebido:", JSON.stringify(body, null, 2));

    // Detectar formato do webhook (Marcha ou legado)
    const isMarchaWebhook =
      body.type === "transaction" && body.data && body.objectId;

    if (isMarchaWebhook) {
      // Processar webhook da Marcha API
      const marchaPayload = body as MarchaWebhookPayload;
      const transactionData = marchaPayload.data;

      console.log("Webhook Marcha recebido:", {
        transaction_id: transactionData.id,
        status: transactionData.status,
        amount: transactionData.amount,
        paidAt: transactionData.paidAt,
      });

      // Validar dados obrigatórios
      if (
        !transactionData.id ||
        !transactionData.amount ||
        !transactionData.customer
      ) {
        return NextResponse.json(
          { error: "Dados obrigatórios ausentes no webhook" },
          { status: 400 }
        );
      }

      // Processar apenas transações pagas (status = "paid")
      if (transactionData.status === "paid") {
        console.log(
          `Transação aprovada ${transactionData.id}, enviando para Meta...`
        );

        // Enviar para Meta Conversion API
        const metaResult = await sendToMetaConversionAPI(marchaPayload);

        if (metaResult.success) {
          console.log(
            `Evento de compra enviado com sucesso para Meta - Transaction: ${transactionData.id}`
          );
          return NextResponse.json({
            success: true,
            message: "Webhook processado e enviado para Meta",
            meta_response: metaResult.data,
          });
        } else {
          console.error(
            `Erro ao enviar para Meta - Transaction: ${transactionData.id}`,
            metaResult.error
          );
          // Retornar sucesso mesmo se Meta falhar, para não reenviar webhook
          return NextResponse.json({
            success: true,
            message: "Webhook recebido, mas erro ao enviar para Meta",
            meta_error: metaResult.error,
          });
        }
      } else {
        console.log(
          `Transação ${transactionData.id} com status ${transactionData.status} - não processada para Meta`
        );
        return NextResponse.json({
          success: true,
          message: "Webhook recebido, transação não está paga",
          status: transactionData.status,
        });
      }
    } else {
      // Formato legado ou desconhecido
      console.log("Webhook em formato desconhecido ou legado:", body);
      return NextResponse.json({
        success: true,
        message: "Webhook recebido (formato não reconhecido)",
      });
    }
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar webhook",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para testar se a rota está ativa
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Webhook endpoint ativo - Marcha API",
    timestamp: new Date().toISOString(),
    configured: !!(META_PIXEL_ID && META_ACCESS_TOKEN),
  });
}
