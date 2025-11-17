import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Configurações do Meta Pixel
const META_PIXEL_ID = 840886561712553;
const META_ACCESS_TOKEN =
  "EAAJ4XUEZAyZCYBPZBgig1s8CASj8ZC8JL0LRCCZBU35ZBEeyVZC0HyW3jjM6uZAQeYOe9PS87P47IuEZBSxiYYQMNmrDTsYCo7ecLhk4S0h9dSTtQbtnLfXxjmhmMkkDAwJBid47d8ZCmIpSKwUoYRDeqKHT56KVVDVx0tzevcX58CoK4MZCtkesVf6VvyAjiZCZBdAZDZD";
const META_API_VERSION = "v18.0";

interface WebhookPayload {
  transaction_id: string;
  external_id: string;
  status: string;
  amount: number;
  payment_method: string;
  customer: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  raw_status: string;
  webhook_type: string;
  timestamp: string;
  tracking?: {
    utm_source?: string;
    utm_campaign?: string;
    utm_medium?: string;
    utm_content?: string;
    utm_term?: string;
    src?: string;
    sck?: string;
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
async function sendToMetaConversionAPI(payload: WebhookPayload) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    console.error("Meta Pixel ID ou Access Token não configurados");
    return { success: false, error: "Meta credentials not configured" };
  }

  const eventTime = Math.floor(new Date(payload.timestamp).getTime() / 1000);
  const currentTime = Math.floor(Date.now() / 1000);

  // Preparar dados do usuário (hasheados conforme exigência da Meta)
  const userData: any = {
    em: hashSHA256(payload.customer.email), // email
    ph: hashSHA256(normalizePhone(payload.customer.phone)), // phone
    fn: hashSHA256(payload.customer.name.split(" ")[0] || ""), // first name
    ln: hashSHA256(payload.customer.name.split(" ").slice(1).join(" ") || ""), // last name
    client_ip_address: "", // Pode ser preenchido se disponível
    client_user_agent: "", // Pode ser preenchido se disponível
    fbc: payload.tracking?.sck || "", // Facebook click ID
    fbp: "", // Facebook browser ID (se disponível via cookie)
  };

  // Preparar dados customizados
  const customData: any = {
    currency: "BRL",
    value: (payload.amount / 100).toFixed(2), // Converter centavos para reais
    content_type: "product",
    transaction_id: payload.transaction_id,
    external_id: payload.external_id,
    payment_method: payload.payment_method,
  };

  // Preparar evento
  const event = {
    event_name: "Purchase",
    event_time: eventTime > 0 ? eventTime : currentTime,
    event_source_url: payload.tracking?.src || "",
    action_source: "website",
    user_data: userData,
    custom_data: customData,
  };

  // Adicionar dados de rastreamento se disponíveis
  if (payload.tracking) {
    if (payload.tracking.utm_source)
      customData.utm_source = payload.tracking.utm_source;
    if (payload.tracking.utm_campaign)
      customData.utm_campaign = payload.tracking.utm_campaign;
    if (payload.tracking.utm_medium)
      customData.utm_medium = payload.tracking.utm_medium;
    if (payload.tracking.utm_content)
      customData.utm_content = payload.tracking.utm_content;
    if (payload.tracking.utm_term)
      customData.utm_term = payload.tracking.utm_term;
  }

  // Montar payload para Meta API
  const metaPayload = {
    data: [event],
    test_event_code: process.env.META_TEST_EVENT_CODE || undefined, // Opcional: para testes
  };

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;

    console.log("Enviando evento para Meta Conversion API:", {
      transaction_id: payload.transaction_id,
      amount: payload.amount,
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
    const body: WebhookPayload = await request.json();

    console.log("Webhook recebido:", {
      transaction_id: body.transaction_id,
      status: body.status,
      amount: body.amount,
      timestamp: body.timestamp,
    });

    // Validar dados obrigatórios
    if (!body.transaction_id || !body.amount || !body.customer) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes no webhook" },
        { status: 400 }
      );
    }

    // Processar apenas transações aprovadas
    if (body.status === "approved" || body.raw_status === "COMPLETED") {
      console.log(
        `Transação aprovada ${body.transaction_id}, enviando para Meta...`
      );

      // Enviar para Meta Conversion API
      const metaResult = await sendToMetaConversionAPI(body);

      if (metaResult.success) {
        console.log(
          `Evento de compra enviado com sucesso para Meta - Transaction: ${body.transaction_id}`
        );
        return NextResponse.json({
          success: true,
          message: "Webhook processado e enviado para Meta",
          meta_response: metaResult.data,
        });
      } else {
        console.error(
          `Erro ao enviar para Meta - Transaction: ${body.transaction_id}`,
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
        `Transação ${body.transaction_id} com status ${body.status} - não processada`
      );
      return NextResponse.json({
        success: true,
        message: "Webhook recebido, mas transação não está aprovada",
        status: body.status,
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
    message: "Webhook endpoint ativo",
    timestamp: new Date().toISOString(),
    configured: !!(META_PIXEL_ID && META_ACCESS_TOKEN),
  });
}
