/**
 * Lib para integração com Supabase
 * Armazena e recupera dados de transações para tracking
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

// Cliente Supabase singleton
let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      "[Supabase] Credenciais não configuradas, usando fallback em memória"
    );
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
}

// Interface para transação armazenada
export interface Transaction {
  id?: string;
  transaction_id: string;
  external_ref?: string;
  status: string;
  amount: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_document?: string;
  customer_ip?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
  paid_at?: string;
  // Tracking parameters
  src?: string;
  sck?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
}

// Fallback: armazenamento em memória (para quando Supabase não está configurado)
const transactionsStore: Map<string, Transaction> = new Map();

/**
 * Salva uma transação no banco
 */
export async function saveTransaction(
  transaction: Transaction
): Promise<Transaction> {
  console.log("[Supabase] Salvando transação:", transaction.transaction_id);

  const now = new Date().toISOString();
  const storedTransaction: Transaction = {
    ...transaction,
    id: transaction.id || `txn_${Date.now()}`,
    created_at: transaction.created_at || now,
    updated_at: now,
  };

  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .upsert(
          {
            transaction_id: storedTransaction.transaction_id,
            external_ref: storedTransaction.external_ref,
            status: storedTransaction.status,
            amount: storedTransaction.amount,
            customer_name: storedTransaction.customer_name,
            customer_email: storedTransaction.customer_email,
            customer_phone: storedTransaction.customer_phone,
            customer_document: storedTransaction.customer_document,
            customer_ip: storedTransaction.customer_ip,
            payment_method: storedTransaction.payment_method,
            created_at: storedTransaction.created_at,
            updated_at: storedTransaction.updated_at,
            paid_at: storedTransaction.paid_at,
            src: storedTransaction.src,
            sck: storedTransaction.sck,
            utm_source: storedTransaction.utm_source,
            utm_campaign: storedTransaction.utm_campaign,
            utm_medium: storedTransaction.utm_medium,
            utm_content: storedTransaction.utm_content,
            utm_term: storedTransaction.utm_term,
          },
          { onConflict: "transaction_id" }
        )
        .select()
        .single();

      if (error) {
        console.error("[Supabase] Erro ao salvar:", error);
        throw error;
      }

      console.log(
        "[Supabase] Transação salva com sucesso no banco:",
        storedTransaction.transaction_id
      );
      return data as Transaction;
    } catch (error) {
      console.error("[Supabase] Erro, usando fallback em memória:", error);
      // Fallback para memória
    }
  }

  // Fallback: armazenamento em memória
  transactionsStore.set(transaction.transaction_id, storedTransaction);
  if (transaction.external_ref) {
    transactionsStore.set(`ref_${transaction.external_ref}`, storedTransaction);
  }

  console.log(
    "[Supabase] Transação salva em memória (fallback):",
    storedTransaction.transaction_id
  );
  return storedTransaction;
}

/**
 * Busca uma transação pelo ID
 */
export async function getTransactionById(
  transactionId: string
): Promise<Transaction | null> {
  console.log("[Supabase] Buscando transação por ID:", transactionId);

  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("transaction_id", transactionId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[Supabase] Erro ao buscar:", error);
      }

      if (data) {
        console.log(
          "[Supabase] Transação encontrada no banco:",
          data.transaction_id
        );
        return data as Transaction;
      }
    } catch (error) {
      console.error("[Supabase] Erro, usando fallback em memória:", error);
    }
  }

  // Fallback: buscar em memória
  const transaction = transactionsStore.get(transactionId);
  if (transaction) {
    console.log(
      "[Supabase] Transação encontrada em memória:",
      transaction.transaction_id
    );
    return transaction;
  }

  console.log("[Supabase] Transação não encontrada:", transactionId);
  return null;
}

/**
 * Busca uma transação pelo external_ref
 */
export async function getTransactionByExternalRef(
  externalRef: string
): Promise<Transaction | null> {
  console.log("[Supabase] Buscando transação por external_ref:", externalRef);

  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("external_ref", externalRef)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[Supabase] Erro ao buscar:", error);
      }

      if (data) {
        console.log(
          "[Supabase] Transação encontrada no banco:",
          data.transaction_id
        );
        return data as Transaction;
      }
    } catch (error) {
      console.error("[Supabase] Erro, usando fallback em memória:", error);
    }
  }

  // Fallback: buscar em memória
  const transaction = transactionsStore.get(`ref_${externalRef}`);
  if (transaction) {
    return transaction;
  }

  for (const txn of transactionsStore.values()) {
    if (txn.external_ref === externalRef) {
      return txn;
    }
  }

  console.log(
    "[Supabase] Transação não encontrada por external_ref:",
    externalRef
  );
  return null;
}

/**
 * Atualiza o status de uma transação
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: string,
  paidAt?: string
): Promise<Transaction | null> {
  console.log("[Supabase] Atualizando status:", transactionId, "->", status);

  const now = new Date().toISOString();

  const supabase = getSupabase();

  if (supabase) {
    try {
      const updateData: Record<string, any> = {
        status,
        updated_at: now,
      };

      if (paidAt) {
        updateData.paid_at = paidAt;
      }

      const { data, error } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("transaction_id", transactionId)
        .select()
        .single();

      if (error) {
        console.error("[Supabase] Erro ao atualizar:", error);
      }

      if (data) {
        console.log("[Supabase] Transação atualizada no banco:", transactionId);
        return data as Transaction;
      }
    } catch (error) {
      console.error("[Supabase] Erro, usando fallback em memória:", error);
    }
  }

  // Fallback: atualizar em memória
  const transaction = transactionsStore.get(transactionId);
  if (!transaction) {
    console.log(
      "[Supabase] Transação não encontrada para atualizar:",
      transactionId
    );
    return null;
  }

  const updatedTransaction: Transaction = {
    ...transaction,
    status,
    updated_at: now,
    paid_at: paidAt || transaction.paid_at,
  };

  transactionsStore.set(transactionId, updatedTransaction);
  console.log(
    "[Supabase] Transação atualizada em memória (fallback):",
    transactionId
  );
  return updatedTransaction;
}

/**
 * Lista todas as transações (para debug)
 */
export async function listTransactions(): Promise<Transaction[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("[Supabase] Erro ao listar:", error);
      }

      if (data) {
        return data as Transaction[];
      }
    } catch (error) {
      console.error("[Supabase] Erro, usando fallback em memória:", error);
    }
  }

  // Fallback: listar da memória
  const transactions: Transaction[] = [];
  for (const [key, value] of transactionsStore.entries()) {
    if (!key.startsWith("ref_")) {
      transactions.push(value);
    }
  }
  return transactions;
}
