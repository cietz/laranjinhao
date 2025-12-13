import { NextRequest, NextResponse } from "next/server";
import {
  sendToUTMify,
  mapMarchaToUTMify,
  UTMifyPayload,
  formatDateForUTMify,
} from "@/lib/utmify";
import {
  getTransactionById,
  getTransactionByExternalRef,
  updateTransactionStatus,
  Transaction,
} from "@/lib/supabase";

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

// Interface para webhook Paradise API (novo formato)
interface ParadiseWebhookPayload {
  transaction_id: string;
  external_id: string;
  status: "pending" | "approved" | "failed" | "refunded";
  amount: number;
  payment_method: "pix" | "boleto" | "credit_card";
  customer: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  raw_status: string;
  webhook_type: "transaction";
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

// Função para enviar evento para UTMify com dados do Paradise webhook
async function sendParadiseToUTMify(
  paradisePayload: ParadiseWebhookPayload,
  storedTransaction: Transaction | null
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Map Paradise status to UTMify status (conforme documentação UTMify)
    const statusMap: Record<string, string> = {
      pending: "waiting_payment",
      approved: "paid",
      failed: "refused",
      refunded: "refunded",
    };

    const utmifyStatus =
      statusMap[paradisePayload.status] || paradisePayload.status;

    // Formatar datas no padrão UTMify: YYYY-MM-DD HH:MM:SS (UTC)
    const createdAt = paradisePayload.timestamp
      ? formatDateForUTMify(
          new Date(paradisePayload.timestamp.replace(" ", "T") + "Z")
        )
      : formatDateForUTMify(new Date());

    const approvedDate =
      paradisePayload.status === "approved" ? createdAt : null;
    const refundedAt = paradisePayload.status === "refunded" ? createdAt : null;

    // Build UTMify payload from Paradise data (conforme documentação oficial)
    const utmifyPayload: UTMifyPayload = {
      orderId: paradisePayload.transaction_id,
      platform: "Laranjinha",
      paymentMethod: paradisePayload.payment_method,
      status: utmifyStatus,
      createdAt,
      approvedDate,
      refundedAt,
      customer: {
        name: paradisePayload.customer.name,
        email: paradisePayload.customer.email,
        phone: paradisePayload.customer.phone || null,
        document: paradisePayload.customer.document || null,
        country: "BR",
        ip: storedTransaction?.customer_ip || null,
      },
      products: [
        {
          id: "plano-premium",
          name: "Plano Premium Laranjinha",
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: paradisePayload.amount,
        },
      ],
      trackingParameters: {
        src: paradisePayload.tracking?.src || storedTransaction?.src || null,
        sck: paradisePayload.tracking?.sck || storedTransaction?.sck || null,
        utm_source:
          paradisePayload.tracking?.utm_source ||
          storedTransaction?.utm_source ||
          null,
        utm_campaign:
          paradisePayload.tracking?.utm_campaign ||
          storedTransaction?.utm_campaign ||
          null,
        utm_medium:
          paradisePayload.tracking?.utm_medium ||
          storedTransaction?.utm_medium ||
          null,
        utm_content:
          paradisePayload.tracking?.utm_content ||
          storedTransaction?.utm_content ||
          null,
        utm_term:
          paradisePayload.tracking?.utm_term ||
          storedTransaction?.utm_term ||
          null,
      },
      commission: {
        totalPriceInCents: paradisePayload.amount,
        gatewayFeeInCents: Math.round(paradisePayload.amount * 0.03),
        userCommissionInCents: Math.round(paradisePayload.amount * 0.97),
      },
      isTest: false,
    };

    console.log("[UTMify Paradise] Enviando transação:", {
      orderId: utmifyPayload.orderId,
      status: utmifyPayload.status,
      tracking: utmifyPayload.trackingParameters,
    });

    const result = await sendToUTMify(utmifyPayload);

    if (!result.success) {
      console.error("[UTMify Paradise] Erro:", result.error);
      return { success: false, error: result.error };
    }

    console.log("[UTMify Paradise] Transação enviada com sucesso:", {
      orderId: utmifyPayload.orderId,
    });

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[UTMify Paradise] Erro ao enviar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Função para enviar evento para UTMify com dados do banco
async function sendToUTMifyWebhook(
  marchaPayload: MarchaWebhookPayload,
  storedTransaction: Transaction | null
) {
  try {
    // Map basic data from Marcha webhook
    const utmifyPayload = mapMarchaToUTMify(marchaPayload.data);

    // If we have stored transaction data, merge tracking params and customer IP
    if (storedTransaction) {
      // Override tracking params with stored data
      utmifyPayload.trackingParameters = {
        src: storedTransaction.src || null,
        sck: storedTransaction.sck || null,
        utm_source: storedTransaction.utm_source || null,
        utm_campaign: storedTransaction.utm_campaign || null,
        utm_medium: storedTransaction.utm_medium || null,
        utm_content: storedTransaction.utm_content || null,
        utm_term: storedTransaction.utm_term || null,
      };

      // Override customer IP if available
      if (storedTransaction.customer_ip) {
        utmifyPayload.customer.ip = storedTransaction.customer_ip;
      }

      console.log(
        "[UTMify Webhook] Using stored tracking params:",
        utmifyPayload.trackingParameters
      );
    } else {
      console.warn(
        "[UTMify Webhook] No stored transaction found, using webhook data only"
      );
    }

    console.log("[UTMify Webhook] Enviando transação:", {
      orderId: utmifyPayload.orderId,
      status: utmifyPayload.status,
    });

    const result = await sendToUTMify(utmifyPayload);

    if (!result.success) {
      console.error("[UTMify Webhook] Erro:", result.error);
      return {
        success: false,
        error: result.error,
      };
    }

    console.log("[UTMify Webhook] Transação enviada com sucesso:", {
      orderId: utmifyPayload.orderId,
    });

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("[UTMify Webhook] Erro ao enviar:", error);
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

    // Detectar formato do webhook
    const isMarchaWebhook =
      body.type === "transaction" && body.data && body.objectId;
    const isParadiseWebhook =
      body.webhook_type === "transaction" && body.transaction_id && body.status;

    // ===============================================================
    // PROCESSAR WEBHOOK PARADISE (novo formato)
    // ===============================================================
    if (isParadiseWebhook) {
      const paradisePayload = body as ParadiseWebhookPayload;

      console.log("Webhook Paradise recebido:", {
        transaction_id: paradisePayload.transaction_id,
        external_id: paradisePayload.external_id,
        status: paradisePayload.status,
        amount: paradisePayload.amount,
        raw_status: paradisePayload.raw_status,
        tracking: paradisePayload.tracking,
      });

      // Validar dados obrigatórios
      if (
        !paradisePayload.transaction_id ||
        !paradisePayload.amount ||
        !paradisePayload.customer
      ) {
        return NextResponse.json(
          { error: "Dados obrigatórios ausentes no webhook Paradise" },
          { status: 400 }
        );
      }

      // Buscar dados armazenados da transação no Supabase
      let storedTransaction: Transaction | null = null;
      try {
        storedTransaction = await getTransactionById(
          paradisePayload.transaction_id
        );

        if (!storedTransaction && paradisePayload.external_id) {
          storedTransaction = await getTransactionByExternalRef(
            paradisePayload.external_id
          );
        }
      } catch (dbError) {
        console.error("[DB] Error fetching transaction:", dbError);
      }

      // Processar baseado no status
      if (paradisePayload.status === "approved") {
        console.log(
          `[Paradise] Transação aprovada ${paradisePayload.transaction_id}, enviando para UTMify...`
        );

        // Atualizar status no banco
        if (storedTransaction) {
          try {
            await updateTransactionStatus(
              storedTransaction.transaction_id,
              "paid",
              paradisePayload.timestamp || new Date().toISOString()
            );
            console.log(
              `[DB] Transaction ${storedTransaction.transaction_id} updated to paid`
            );
          } catch (dbError) {
            console.error("[DB] Error updating transaction:", dbError);
          }
        }

        // Enviar para UTMify
        const utmifyResult = await sendParadiseToUTMify(
          paradisePayload,
          storedTransaction
        );

        if (utmifyResult.success) {
          console.log(
            `[UTMify] Transação Paradise enviada com sucesso - ID: ${paradisePayload.transaction_id}`
          );
        } else {
          console.error(
            `[UTMify] Erro ao enviar Paradise - ID: ${paradisePayload.transaction_id}`,
            utmifyResult.error
          );
        }

        return NextResponse.json({
          success: true,
          message: "Webhook Paradise processado - pagamento aprovado",
          utmify: {
            success: utmifyResult.success,
            error: utmifyResult.error,
            data: utmifyResult.data,
          },
        });
      } else if (paradisePayload.status === "refunded") {
        console.log(
          `[Paradise] Transação reembolsada ${paradisePayload.transaction_id}`
        );

        // Atualizar status no banco
        if (storedTransaction) {
          try {
            await updateTransactionStatus(
              storedTransaction.transaction_id,
              "refunded",
              paradisePayload.timestamp || new Date().toISOString()
            );
          } catch (dbError) {
            console.error("[DB] Error updating transaction:", dbError);
          }
        }

        // Enviar para UTMify
        const utmifyResult = await sendParadiseToUTMify(
          paradisePayload,
          storedTransaction
        );

        return NextResponse.json({
          success: true,
          message: "Webhook Paradise processado - pagamento reembolsado",
          utmify: { success: utmifyResult.success },
        });
      } else if (paradisePayload.status === "failed") {
        console.log(
          `[Paradise] Transação falhou ${paradisePayload.transaction_id}`
        );

        if (storedTransaction) {
          try {
            await updateTransactionStatus(
              storedTransaction.transaction_id,
              "failed",
              paradisePayload.timestamp || new Date().toISOString()
            );
          } catch (dbError) {
            console.error("[DB] Error updating transaction:", dbError);
          }
        }

        return NextResponse.json({
          success: true,
          message: "Webhook Paradise processado - pagamento falhou",
          status: paradisePayload.status,
        });
      } else {
        console.log(
          `[Paradise] Transação ${paradisePayload.transaction_id} com status ${paradisePayload.status} - aguardando`
        );
        return NextResponse.json({
          success: true,
          message: "Webhook Paradise recebido - aguardando pagamento",
          status: paradisePayload.status,
        });
      }
    }

    // ===============================================================
    // PROCESSAR WEBHOOK MARCHA (formato legado)
    // ===============================================================
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
          `Transação aprovada ${transactionData.id}, enviando para UTMify...`
        );

        // Buscar dados armazenados da transação no Supabase
        let storedTransaction: Transaction | null = null;
        try {
          // Try to find by transaction_id first
          storedTransaction = await getTransactionById(
            String(transactionData.id)
          );

          // If not found, try by externalRef
          if (!storedTransaction && transactionData.externalRef) {
            storedTransaction = await getTransactionByExternalRef(
              transactionData.externalRef
            );
          }

          // Update transaction status in database
          if (storedTransaction) {
            await updateTransactionStatus(
              storedTransaction.transaction_id,
              "paid",
              transactionData.paidAt || new Date().toISOString()
            );
            console.log(
              `[DB] Transaction ${storedTransaction.transaction_id} updated to paid`
            );
          }
        } catch (dbError) {
          console.error("[DB] Error fetching/updating transaction:", dbError);
          // Continue even if DB operations fail
        }

        // Enviar para UTMify with stored tracking data
        const utmifyResult = await sendToUTMifyWebhook(
          marchaPayload,
          storedTransaction
        );

        // Log resultado
        if (utmifyResult.success) {
          console.log(
            `[UTMify] Transação enviada com sucesso - Transaction: ${transactionData.id}`
          );
        } else {
          console.error(
            `[UTMify] Erro ao enviar - Transaction: ${transactionData.id}`,
            utmifyResult.error
          );
        }

        // Retornar sucesso mesmo se falhar, para não reenviar webhook
        return NextResponse.json({
          success: true,
          message: "Webhook processado",
          utmify: {
            success: utmifyResult.success,
            error: utmifyResult.error,
            data: utmifyResult.data,
          },
        });
      } else {
        console.log(
          `Transação ${transactionData.id} com status ${transactionData.status} - não processada`
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
  });
}
