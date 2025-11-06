import { NextRequest, NextResponse } from "next/server";

// Configurações da API Oasify
const OASIFY_BASE_URL = "https://app.oasyfy.com/api/v1";
const OASIFY_PUBLIC_KEY =
  process.env.OASIFY_PUBLIC_KEY || "agenciahumanize7_jyennx1cpl3gzcpa";
const OASIFY_SECRET_KEY =
  process.env.OASIFY_SECRET_KEY ||
  "tg4hv8tfsoz70yfsqynpmhw6lufkbuk4t4wqdwgybwy04kcl6w9qf8l0bw6gsm9s";

function buildOasifyHeaders() {
  return {
    "Content-Type": "application/json",
    "x-public-key": OASIFY_PUBLIC_KEY,
    "x-secret-key": OASIFY_SECRET_KEY,
  } satisfies Record<string, string>;
}

function generateCpf(): string {
  const digits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  );
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit1);
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit2);
  return digits.join("");
}

function generatePhone(): string {
  const ddd = Math.floor(Math.random() * 90) + 10;
  const first = Math.floor(Math.random() * 90000) + 10000;
  const second = Math.floor(Math.random() * 9000) + 1000;
  return `${ddd}9${first}${second}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, description: bodyDescription, name, email } = body;

    // Validação dos dados recebidos
    const description = bodyDescription || "Pagamento Laranjinha Midias";

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: "Campo value é obrigatório" },
        { status: 400 }
      );
    }

    // Normalize incoming value to number
    const incomingNumber = Number(value);
    if (Number.isNaN(incomingNumber)) {
      return NextResponse.json(
        { error: "Campo value deve ser um número" },
        { status: 400 }
      );
    }

    // Oasify espera valor em reais (decimal), não centavos
    let amountInReais: number;
    if (incomingNumber > 1000) {
      // Se for maior que 1000, assume que é em centavos e converte para reais
      amountInReais = Number((incomingNumber / 100).toFixed(2));
    } else {
      // Se for menor, assume que já está em reais
      amountInReais = Number(incomingNumber.toFixed(2));
    }

    // Validação de valor mínimo
    if (amountInReais < 1) {
      console.log(
        "/api/pix POST - rejected: amountInReais < 1.00",
        amountInReais
      );
      return NextResponse.json(
        { error: "Valor mínimo permitido: R$ 1,00" },
        { status: 400 }
      );
    }

    // Debug log
    console.log(
      "/api/pix POST received value (raw):",
      value,
      "parsed:",
      incomingNumber,
      "reais:",
      amountInReais
    );

    // Gerar identificador único para a transação
    const identifier = `laranjinha-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    // Preparar payload para Oasify API
    const requestBody = {
      identifier: identifier,
      amount: amountInReais,
      client: {
        name: name || "Cliente Laranjinha",
        email: email || `cliente${Date.now()}@laranjinha.com`,
        document: generateCpf(),
        phone: generatePhone(),
      },
      metadata: {
        description: description,
        source: "laranjinha-midias",
      },
    };

    console.log("Oasify API request:", {
      ...requestBody,
      amount: `R$ ${amountInReais.toFixed(2)}`,
    });

    const response = await fetch(`${OASIFY_BASE_URL}/gateway/pix/receive`, {
      method: "POST",
      headers: buildOasifyHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log("Oasify API response status:", response.status);

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    if (!response.ok) {
      console.log(`/api/pix POST - Oasify error status: ${response.status}`);
      console.log(`/api/pix POST - Oasify error response:`, text);

      let errorMessage = "Erro ao gerar pagamento PIX";
      if (response.status === 400) {
        errorMessage = data?.message || "Dados inválidos enviados";
      } else if (response.status === 401) {
        errorMessage = "Credenciais inválidas";
      } else if (response.status === 500) {
        errorMessage = "Erro interno no gateway";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          remote: data,
        },
        { status: 502 }
      );
    }

    console.log("Oasify API response data:", data);

    // Extrair dados da resposta Oasify
    const transactionId = data?.transactionId || data?.id || null;
    const pixData = data?.pix || {};
    const qr_code = pixData?.code || pixData?.qrCode || null;
    const qr_code_base64 = pixData?.base64 || pixData?.qrCodeBase64 || null;

    // Se não há QR code, retorna erro
    if (!qr_code && !qr_code_base64) {
      return NextResponse.json(
        {
          error: "QR Code não encontrado na resposta",
          remote: data,
        },
        { status: 502 }
      );
    }

    // Gerar imagem base64 do QR code se necessário
    let resolved_qr_code_base64 = qr_code_base64;
    if (!resolved_qr_code_base64 && qr_code) {
      try {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(
          qr_code
        )}`;
        const qrResp = await fetch(qrApiUrl);
        if (qrResp.ok) {
          const arr = await qrResp.arrayBuffer();
          const buf = Buffer.from(arr);
          resolved_qr_code_base64 = `data:image/png;base64,${buf.toString(
            "base64"
          )}`;
        }
      } catch (e) {
        console.error("Erro ao gerar QR code base64:", e);
        resolved_qr_code_base64 = null;
      }
    }

    // Calcular data de expiração (15 minutos a partir de agora)
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const status = data?.status || "PENDING";
    const valueInCents = Math.round(amountInReais * 100);

    return NextResponse.json({
      id: transactionId,
      identifier: identifier,
      qr_code,
      qr_code_base64: resolved_qr_code_base64,
      amount_cents: valueInCents,
      amount: amountInReais,
      amount_formatted: amountInReais.toFixed(2).replace(".", ","),
      created_at: createdAt,
      status: status,
      expires_at: expiresAt,
      raw: data,
    });
  } catch (error) {
    console.error("/api/pix POST - erro interno:", error);
    let errorMessage = "Erro interno do servidor";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const identifier = searchParams.get("identifier");

  if (!id && !identifier) {
    return NextResponse.json(
      { error: "ID ou identifier do pagamento é obrigatório" },
      { status: 400 }
    );
  }

  try {
    console.log(
      `/api/pix GET - checking payment status for ID: ${id || identifier}`
    );

    // Construir URL com parâmetros de query
    const queryParams = new URLSearchParams();
    if (id) queryParams.append("id", id);
    if (identifier) queryParams.append("clientIdentifier", identifier);

    const response = await fetch(
      `${OASIFY_BASE_URL}/gateway/transactions?${queryParams.toString()}`,
      {
        method: "GET",
        headers: buildOasifyHeaders(),
      }
    );

    console.log(`/api/pix GET - Oasify response status: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log(
        `/api/pix GET - Oasify response data:`,
        JSON.stringify(data, null, 2)
      );

      // Normalizar o status da resposta
      const normalizedData = {
        ...data,
        status: data.status || "PENDING",
        payment: {
          status: data.status || "PENDING",
        },
      };

      return NextResponse.json(normalizedData);
    } else {
      let errorData: any = { message: "Unknown error" };
      try {
        errorData = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        errorData = { message: text || "Erro desconhecido na API" };
      }
      console.log(
        `/api/pix GET - Oasify error response:`,
        JSON.stringify(errorData, null, 2)
      );
      return NextResponse.json(
        { error: errorData.message || "Erro ao consultar pagamento" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error(`/api/pix GET - Network error:`, error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
