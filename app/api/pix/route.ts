import { NextRequest, NextResponse } from "next/server";

const PARADISE_BASE_URL = "https://multi.paradisepags.com/api/v1";
const PARADISE_RECIPIENT_ID =
  process.env.PARADISE_RECIPIENT_ID || "store_0afec61ca149d854";
const PARADISE_SECRET_KEY =
  process.env.PARADISE_SECRET_KEY ||
  "sk_1024d231bf209bf83fbaf43e6c39d8034f82cea4c0c348558e0fc762a6648cd9";
const PARADISE_PRODUCT_HASH =
  process.env.PARADISE_PRODUCT_HASH || "produto_default";

function buildParadiseHeaders() {
  return {
    "Content-Type": "application/json",
    "X-API-Key": PARADISE_SECRET_KEY,
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
    const { value, description: bodyDescription } = body;

    // Validação dos dados recebidos
    const description = bodyDescription || "Pagamento Laranjinha Midias";
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

    // Minimum validation: manter valor mínimo de 1 real para evitar rejeições
    if (valueInCents < 100) {
      console.log(
        "/api/pix POST - rejected: valueInCents < 100 (1 real)",
        valueInCents
      );
      return new NextResponse(
        JSON.stringify({ error: "Valor minimo permitido: 1.00" }),
        {
          status: 400,
        }
      );
    }

    // Debug log
    console.log(
      "/api/pix POST received value (raw):",
      value,
      "parsed:",
      incomingNumber,
      "cents:",
      valueInCents
    );

    const amount = Number((valueInCents / 100).toFixed(2));

    // Preparar payload para Paradise API
    const requestBody = {
      amount: valueInCents, // Paradise espera valor em centavos
      description: description || "Pagamento Laranjinha Midias Premium",
      reference: `laranjinha-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`,
      productHash: PARADISE_PRODUCT_HASH,
      customer: {
        name: "Cliente Laranjinha",
        email: `cliente${Date.now()}@laranjinha.com`,
        document: generateCpf(),
        phone: generatePhone(),
      },
    };

    console.log("Paradise API request:", {
      ...requestBody,
      amount: `${valueInCents} cents (R$ ${amount})`,
    });

    const response = await fetch(`${PARADISE_BASE_URL}/transaction.php`, {
      method: "POST",
      headers: buildParadiseHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log("Paradise API response status:", response.status);

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    if (!response.ok) {
      console.log(`/api/pix POST - Paradise error status: ${response.status}`);
      console.log(`/api/pix POST - Paradise error response:`, text);

      let errorMessage = "Erro ao gerar pagamento PIX";
      if (response.status === 400) {
        errorMessage = "Dados inválidos enviados";
      } else if (response.status === 401) {
        errorMessage = "Credenciais inválidas";
      } else if (response.status === 500) {
        errorMessage = "Erro interno no gateway";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          remote: text,
        },
        { status: 502 }
      );
    }

    console.log("Paradise API response data:", data);

    // Verificar se a resposta foi bem-sucedida
    if (data?.status !== "success") {
      return NextResponse.json(
        {
          error: "Erro ao gerar pagamento PIX",
          remote: data,
        },
        { status: 502 }
      );
    }

    // Extrair dados da resposta Paradise
    const qr_code = data?.qr_code || null;
    const qr_code_base64 = data?.qr_code_base64 || null;
    const transactionId = data?.transaction_id || data?.id || null;

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
        resolved_qr_code_base64 = null;
      }
    }

    const createdAt = data?.createdAt || new Date().toISOString();
    const expiresAt =
      data?.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const status = data?.status || "pending";

    return NextResponse.json({
      id: transactionId,
      qr_code,
      qr_code_base64: resolved_qr_code_base64,
      amount_cents: valueInCents,
      amount: amount,
      amount_formatted: amount.toFixed(2).replace(".", ","),
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

  if (!id) {
    return NextResponse.json(
      { error: "ID do pagamento é obrigatório" },
      { status: 400 }
    );
  }

  try {
    console.log(`/api/pix GET - checking payment status for ID: ${id}`);

    const response = await fetch(
      `${PARADISE_BASE_URL}/query.php?action=get_transaction&id=${id}`,
      {
        method: "GET",
        headers: buildParadiseHeaders(),
      }
    );

    console.log(`/api/pix GET - Paradise response status: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log(
        `/api/pix GET - Paradise response data:`,
        JSON.stringify(data, null, 2)
      );
      return NextResponse.json(data);
    } else {
      let errorData: any = { message: "Unknown error" };
      try {
        errorData = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        errorData = { message: text || "Erro desconhecido na API" };
      }
      console.log(
        `/api/pix GET - Paradise error response:`,
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
