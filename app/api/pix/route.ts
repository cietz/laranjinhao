import { NextRequest, NextResponse } from "next/server";

// Configurações da API Marcha
const MARCHA_BASE_URL = "https://api.marchabb.com/v1";

// Chaves para teste local (remover em produção)
const MARCHA_PUBLIC_KEY =
  process.env.MARCHA_PUBLIC_KEY?.trim() ||
  "pk_YJl0fMP4j7PGAemvjkRFV_PcQBXotDd56PSNooXJf9thon91";
const MARCHA_SECRET_KEY =
  process.env.MARCHA_SECRET_KEY?.trim() ||
  "sk_EJXMXhMP7jBbriKR71iXozTLAUzUA3EgqF6XtWnWId8Wb9kI";

function ensureMarchaCredentials() {
  if (!MARCHA_PUBLIC_KEY || !MARCHA_SECRET_KEY) {
    throw new Error(
      "Credenciais da Marcha ausentes (PUBLIC_KEY e SECRET_KEY são obrigatórias)"
    );
  }
}

function buildMarchaHeaders() {
  ensureMarchaCredentials();
  if (!MARCHA_PUBLIC_KEY || !MARCHA_SECRET_KEY) {
    throw new Error("Credenciais da Marcha ausentes");
  }

  // Basic Auth: base64(publicKey:secretKey) conforme documentação
  const auth =
    "Basic " +
    Buffer.from(MARCHA_PUBLIC_KEY + ":" + MARCHA_SECRET_KEY).toString("base64");

  // Debug: mostrar credenciais sendo usadas (remover em produção)
  console.log(
    "Marcha Auth - PUBLIC_KEY:",
    MARCHA_PUBLIC_KEY?.substring(0, 10) + "..."
  );
  console.log(
    "Marcha Auth - SECRET_KEY:",
    MARCHA_SECRET_KEY?.substring(0, 10) + "..."
  );
  console.log("Marcha Auth - Header:", auth.substring(0, 30) + "...");

  return {
    "Content-Type": "application/json",
    Authorization: auth,
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
  return `${ddd}9${first}${second}`;
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
    const description = bodyDescription || "Pagamento via Marcha";
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
      valueInCents = Math.trunc(incomingNumber * 100);
    }

    // Minimum validation: manter valor mínimo de 3 reais para evitar rejeições
    if (valueInCents < 300) {
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

    // Debug log to confirm incoming value from frontend
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

    // Marcha API usa valor em centavos
    const amount = valueInCents;

    // Gerar documento e telefone se não fornecidos
    const documentNumber = safeString(metadata?.document) || generateCpf();
    const phone = safeString(metadata?.phone) || generatePhone();

    // Payload para API Marcha - criar transação PIX
    // Formato conforme documentação oficial: https://api.marchabb.com/v1/transactions
    const externalRef = safeString(metadata?.identifier) || `pix-${Date.now()}`;

    const requestBody: Record<string, unknown> = {
      amount: amount, // valor em centavos
      paymentMethod: "pix", // minúsculo conforme documentação
      pix: {
        expiresInSeconds: 900, // 15 minutos
      },
      customer: {
        name: name,
        email: email,
        document: {
          number: documentNumber,
          type: documentNumber.length > 11 ? "cnpj" : "cpf", // minúsculo conforme API
        },
        phone: phone, // string simples conforme API
      },
      items: [
        {
          title: description,
          unitPrice: amount,
          quantity: 1,
          tangible: false,
        },
      ],
      postbackUrl: webhook_url,
      externalRef: externalRef,
    };

    // Adicionar metadata apenas se existir
    if (metadata && Object.keys(metadata).length > 0) {
      requestBody.metadata = JSON.stringify(metadata);
    }

    console.log(
      "/api/pix POST - Enviando para Marcha:",
      JSON.stringify(requestBody, null, 2)
    );

    const response = await fetch(`${MARCHA_BASE_URL}/transactions`, {
      method: "POST",
      headers: buildMarchaHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log(
      "Proxied request to Marcha with body value (cents):",
      amount,
      "status:",
      response.status
    );

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    if (!response.ok) {
      console.log(`/api/pix POST - Marcha error status: ${response.status}`);
      console.log(`/api/pix POST - Marcha error response:`, text);

      let errorMessage = "Erro ao gerar pagamento PIX";
      if (response.status === 400) {
        // Tentar extrair mensagem de erro específica da resposta
        if (data?.refusedReason?.description) {
          errorMessage = data.refusedReason.description;
        } else if (data?.error) {
          errorMessage = data.error;
        } else {
          errorMessage = "Dados inválidos enviados para Marcha";
        }
      } else if (response.status === 401) {
        errorMessage = "Credenciais inválidas";
      } else if (response.status === 500) {
        errorMessage = "Erro interno na Marcha";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          remote: text,
        },
        { status: response.status || 500 }
      );
    }

    console.log(
      "/api/pix POST - Marcha response:",
      JSON.stringify(data, null, 2)
    );

    // Verificar se a transação foi recusada
    if (data?.status === "refused") {
      const refusedReason =
        data?.refusedReason?.description || "Transação recusada pela Marcha";
      console.log(`/api/pix POST - Transação recusada: ${refusedReason}`);
      return NextResponse.json(
        {
          error: refusedReason,
          status: "refused",
          acquirerCode: data?.refusedReason?.acquirerCode,
          remote: data,
        },
        { status: 400 }
      );
    }

    // Extrair dados do PIX da resposta da Marcha
    const pixInfo = data?.pix;

    // Debug: log completo do objeto pix
    console.log("/api/pix POST - PIX Info:", JSON.stringify(pixInfo, null, 2));

    // QR Code payload (string para copiar/colar) - tentar múltiplos campos possíveis
    const qr_code =
      pixInfo?.qrcodeText ||
      pixInfo?.qrCodeText ||
      pixInfo?.qrcode ||
      pixInfo?.qrCode ||
      pixInfo?.payload ||
      pixInfo?.copyAndPaste ||
      pixInfo?.emv ||
      pixInfo?.brcode ||
      data?.qrcode ||
      data?.qrcodeText ||
      null;

    console.log(
      "/api/pix POST - QR Code extraído:",
      qr_code ? qr_code.substring(0, 50) + "..." : "null"
    );

    // URL da imagem do QR Code (se fornecida pela API)
    const qr_code_url =
      pixInfo?.qrcodeUrl ||
      pixInfo?.qrCodeUrl ||
      pixInfo?.imageUrl ||
      pixInfo?.qrcodeImage ||
      null;

    console.log("/api/pix POST - QR Code URL:", qr_code_url);

    // QR Code base64 image
    let qr_code_base64 =
      pixInfo?.qrCodeBase64 ||
      pixInfo?.qrcodeBase64 ||
      pixInfo?.image ||
      pixInfo?.imageBase64 ||
      pixInfo?.base64 ||
      null;

    // Se não veio base64, tentar baixar da URL ou gerar do payload
    if (!qr_code_base64) {
      const urlToFetch =
        qr_code_url ||
        (qr_code
          ? `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(
              qr_code
            )}`
          : null);
      if (urlToFetch) {
        try {
          const qrResp = await fetch(urlToFetch);
          if (qrResp.ok) {
            const arr = await qrResp.arrayBuffer();
            const buf = Buffer.from(arr);
            qr_code_base64 = `data:image/png;base64,${buf.toString("base64")}`;
          }
        } catch (e) {
          console.error("Erro ao gerar QR Code base64:", e);
          qr_code_base64 = null;
        }
      }
    }

    // Se não há QR nem base64, retorna erro
    if (!qr_code && !qr_code_base64) {
      return NextResponse.json(
        {
          error: "QR Code não encontrado na resposta da Marcha",
          remote: data,
        },
        { status: 502 }
      );
    }

    // Normalizar campos da resposta
    const normalizedId = data?.id || data?.transactionId || null;
    const createdAt = data?.createdAt || new Date().toISOString();
    const expiresAt =
      pixInfo?.expirationDate ||
      new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const normalizedStatus = data?.status || "waiting_payment";

    // Retorna valor em cents e em reais
    const amount_cents = valueInCents;
    const normalizedAmount = amount_cents / 100;
    const amount_formatted = normalizedAmount.toFixed(2).replace(".", ",");

    return NextResponse.json({
      id: normalizedId,
      qr_code,
      qr_code_base64,
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

    // Buscar transação por ID na API Marcha
    // Endpoint: GET /transactions/:id conforme documentação
    const response = await fetch(`${MARCHA_BASE_URL}/transactions/${id}`, {
      method: "GET",
      headers: buildMarchaHeaders(),
    });

    console.log(`/api/pix GET - Marcha response status: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log(
        `/api/pix GET - Marcha response data:`,
        JSON.stringify(data, null, 2)
      );

      // Normalizar resposta para o frontend
      // A API pode retornar um array ou objeto único
      const transaction = Array.isArray(data) ? data[0] : data;

      return NextResponse.json({
        id: transaction?.id,
        status: transaction?.status,
        amount: transaction?.amount,
        paidAt: transaction?.paidAt,
        createdAt: transaction?.createdAt,
        customer: transaction?.customer,
        raw: transaction,
      });
    } else {
      let errorData: any = { message: "Unknown error" };
      try {
        errorData = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        errorData = { message: text || "Erro desconhecido na API Marcha" };
      }
      console.log(
        `/api/pix GET - Marcha error response:`,
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
