import { NextRequest, NextResponse } from "next/server";

const OASYFY_BASE_URL = "https://app.oasyfy.com/api/v1";
const OASYFY_PUBLIC_KEY = process.env.OASYFY_PUBLIC_KEY;
const OASYFY_SECRET_KEY = process.env.OASYFY_SECRET_KEY;

function ensureOasyfyCredentials() {
  if (!OASYFY_PUBLIC_KEY || !OASYFY_SECRET_KEY) {
    throw new Error("Credenciais da Oasyfy ausentes");
  }
}

function buildOasyfyHeaders() {
  ensureOasyfyCredentials();
  if (!OASYFY_PUBLIC_KEY || !OASYFY_SECRET_KEY) {
    throw new Error("Credenciais da Oasyfy ausentes");
  }
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-public-key": OASYFY_PUBLIC_KEY,
    "x-secret-key": OASYFY_SECRET_KEY,
  } satisfies Record<string, string>;
}

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function generateCpf(): string {
  // Gera os 9 primeiros dígitos aleatórios
  const digits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  );

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit1);

  // Calcula o segundo dígito verificador
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
  const ddd = Math.floor(Math.random() * 90) + 10; // dois dígitos entre 10 e 99
  const first = Math.floor(Math.random() * 9000) + 1000; // 4 dígitos
  const second = Math.floor(Math.random() * 9000) + 1000; // 4 dígitos
  return `+55${ddd}9${first}${second}`;
}
async function randomPersonName() {
  const names = [
    "Ana",
    "Bruno",
    "Carla",
    "Daniel",
    "Eduarda",
    "Felipe",
    "Gabriela",
    "Henrique",
  ];
  return names[Math.floor(Math.random() * names.length)];
}
async function randomEmail() {
  const domains = ["example.com", "test.com", "demo.com", "sample.com"];
  const name = Math.random().toString(36).substring(2, 10);
  return `${name}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      value,
      metadata,
      name: bodyName,
      email: bodyEmail,
      description: bodyDescription,
      webhook_url: bodyWebhook,
    } = body;

    // Validação dos dados recebidos
    const webhook_url = bodyWebhook || "https://imperiovips.com/webhook/";
    const description = bodyDescription || "Pagamento via Oasyfy";
    const name = bodyName || (await randomPersonName());
    const email = bodyEmail || (await randomEmail());
    // Accept either decimal reais (e.g. 19.9 or 0.04) OR integer centavos (e.g. 1990)
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

    // If value looks like reais decimal (less than, say, 1000), interpret as reais and convert to cents
    // If value is already a large integer (>1000), assume it's cents
    let valueInCents: number;
    if (incomingNumber > 1000) {
      // probably already in cents
      valueInCents = Math.round(incomingNumber);
    } else {
      // treat as reais decimal
      // Use truncation to avoid rounding up small fractional-cent values.
      // e.g. 0.1990 * 100 = 19.9 -> trunc -> 19 (centavos)
      valueInCents = Math.trunc(incomingNumber * 100);
    }

    // Minimum validation: manter valor mínimo de 3 reais para evitar rejeições
    // NOTE: Ajuste se o provedor aceitar valores menores
    if (valueInCents < 300) {
      // 3 reais = 300 centavos
      console.log(
        "/api/pix POST - rejected: valueInCents < 300 (3 reais)",
        valueInCents
      );
      return new NextResponse(
        JSON.stringify({ error: "Valor minimo permitido: 3.00" }),
        {
          status: 400,
        }
      );
    }

    // Debug log to confirm incoming value from frontend (raw and normalized cents)
    console.log(
      "/api/pix POST received value (raw):",
      value,
      "parsed:",
      incomingNumber,
      "cents:",
      valueInCents
    );
    if (!name || !email || !description || !webhook_url) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, email, description, webhook_url" },
        { status: 400 }
      );
    }

    const amount = Number((valueInCents / 100).toFixed(2));
    const identifier =
      safeString(metadata?.identifier) ||
      `pix-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const clientIdentifier =
      safeString(metadata?.clientIdentifier) || safeString(email) || identifier;

    const clientPayload: Record<string, unknown> = {
      identifier: clientIdentifier,
      name,
      email,
    };

    if (metadata && typeof metadata === "object") {
      const candidateDocument = safeString((metadata as any).document);
      const candidateDocumentType = safeString((metadata as any).documentType);
      const candidatePhone = safeString((metadata as any).phone);

      if (candidateDocument) clientPayload.document = candidateDocument;
      if (candidateDocumentType) {
        clientPayload.documentType = candidateDocumentType;
      }
      if (candidatePhone) clientPayload.phone = candidatePhone;
    }

    if (!clientPayload.document) {
      clientPayload.document = generateCpf();
      clientPayload.documentType = "CPF";
    }

    if (!clientPayload.documentType) {
      clientPayload.documentType = "CPF";
    }

    if (!clientPayload.phone) {
      clientPayload.phone = generatePhone();
    }

    const normalizedMetadata = metadata === undefined ? {} : metadata;

    const requestBody: Record<string, unknown> = {
      identifier,
      amount,
      client: clientPayload,
      metadata: normalizedMetadata,
      callbackUrl: webhook_url,
    };

    if (description) {
      requestBody.description = description;
    }

    const response = await fetch(`${OASYFY_BASE_URL}/gateway/pix/receive`, {
      method: "POST",
      headers: buildOasyfyHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log(
      "Proxied request to Oasyfy with body value (reais):",
      amount,
      "status:",
      response.status
    );

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // response not JSON
      data = text;
    }

    if (!response.ok) {
      console.log(`/api/pix POST - Oasyfy error status: ${response.status}`);
      const errorText = text;
      console.log(`/api/pix POST - Oasyfy error response:`, errorText);

      let errorMessage = "Erro ao gerar pagamento PIX";
      if (response.status === 400) {
        errorMessage = "Dados inválidos enviados para Oasyfy";
      } else if (response.status === 401) {
        errorMessage = "Credenciais inválidas";
      } else if (response.status === 500) {
        errorMessage = "Erro interno na Oasyfy";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          remote: errorText,
        },
        { status: 502 }
      );
    }

    const pixInfo =
      data?.pix ||
      data?.order?.pix ||
      data?.data?.pix ||
      data?.order?.payment?.pix ||
      data?.pixInformation;

    // Tentar extrair QR code de formas comuns que a API pode retornar
    const qr_candidates = [
      data?.qr_code,
      data?.qrCode,
      data?.qrcode,
      data?.payload,
      pixInfo?.payload,
      pixInfo?.qrCode,
      pixInfo?.copyAndPaste,
      pixInfo?.emv,
      pixInfo?.code,
      data?.pix_qr,
      data?.data?.qr_code,
      data?.payment?.qr_code,
      data?.pix?.qrcode,
    ];
    const qr_code =
      qr_candidates.find((v) => typeof v === "string" && v.length > 0) || null;

    const b64_candidates = [
      data?.qr_code_base64,
      data?.qrCodeBase64,
      data?.qr_code_base64_string,
      data?.base64,
      pixInfo?.image,
      pixInfo?.imageBase64,
      pixInfo?.qrCodeImage,
      pixInfo?.payloadImage,
    ];
    const qr_code_base64 =
      b64_candidates.find((v) => typeof v === "string" && v.length > 0) || null;

    // Se não há QR nem base64, retorna erro com payload remoto
    if (!qr_code && !qr_code_base64) {
      return NextResponse.json(
        {
          error: "QR Code não encontrado na resposta da Oasyfy",
          remote: data,
        },
        { status: 502 }
      );
    }

    // Se não veio base64, gerar PNG do payload do QR e codificar em base64
    let resolved_qr_code_base64 = qr_code_base64;
    if (!resolved_qr_code_base64 && qr_code) {
      try {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(
          qr_code
        )}`;
        const qrResp = await fetch(qrApiUrl);
        if (qrResp.ok) {
          const arr = await qrResp.arrayBuffer();
          // Buffer is available in Node runtime used by Next
          const buf = Buffer.from(arr);
          resolved_qr_code_base64 = `data:image/png;base64,${buf.toString(
            "base64"
          )}`;
        }
      } catch (e) {
        // ignore - we'll return without base64
        resolved_qr_code_base64 = null;
      }
    }

    // Normalizar campos a partir do payload remoto
    const normalizedId =
      data?.transactionId ||
      data?.id ||
      data?.paymentId ||
      data?.payment_id ||
      data?.order?.id ||
      data?.data?.paymentId ||
      data?.data?.payment_id ||
      data?.payment?.id ||
      null;

    const createdAt =
      data?.createdAt ||
      data?.order?.createdAt ||
      data?.created_at ||
      data?.data?.created_at ||
      new Date().toISOString();

    const expiresAt =
      pixInfo?.expiresAt ||
      data?.expiresAt ||
      data?.expires_at ||
      data?.data?.expires_at ||
      new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const normalizedStatus =
      data?.status || data?.order?.status || data?.data?.status || "pending";

    // Retorna valor em cents e em reais (número) e formatado para facilitar uso no frontend
    const amount_cents = valueInCents;
    const normalizedAmount =
      typeof amount === "number" ? amount : amount_cents / 100;
    const amount_formatted =
      typeof normalizedAmount === "number"
        ? normalizedAmount.toFixed(2).replace(".", ",")
        : null;

    return NextResponse.json({
      id: normalizedId,
      qr_code,
      qr_code_base64: resolved_qr_code_base64,
      amount_cents,
      amount: normalizedAmount,
      amount_formatted,
      created_at: createdAt,
      status: normalizedStatus,
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

  if (!id) {
    return NextResponse.json(
      { error: "ID do pagamento é obrigatório" },
      { status: 400 }
    );
  }

  try {
    console.log(`/api/pix GET - checking payment status for ID: ${id}`);
    const statusUrl = new URL(`${OASYFY_BASE_URL}/gateway/transactions`);
    statusUrl.searchParams.set("id", id);

    const response = await fetch(statusUrl.toString(), {
      headers: buildOasyfyHeaders(),
    });

    console.log(`/api/pix GET - Oasyfy response status: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log(
        `/api/pix GET - Oasyfy response data:`,
        JSON.stringify(data, null, 2)
      );
      return NextResponse.json(data);
    } else {
      let errorData: any = { message: "Unknown error" };
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // Se não conseguir fazer parse do JSON, tenta pegar o texto
        const text = await response.text();
        errorData = { message: text || "Erro desconhecido na API externa" };
      }
      console.log(
        `/api/pix GET - Oasyfy error response:`,
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
