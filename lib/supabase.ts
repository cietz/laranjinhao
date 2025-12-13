/**
 * Lib para integração com Supabase
 * Armazena e recupera dados de transações para tracking
 */

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

// Simula armazenamento em memória (substituir por Supabase real em produção)
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

  transactionsStore.set(transaction.transaction_id, storedTransaction);

  // Se tiver external_ref, também indexar por ele
  if (transaction.external_ref) {
    transactionsStore.set(`ref_${transaction.external_ref}`, storedTransaction);
  }

  console.log(
    "[Supabase] Transação salva com sucesso:",
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

  const transaction = transactionsStore.get(transactionId);

  if (transaction) {
    console.log("[Supabase] Transação encontrada:", transaction.transaction_id);
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

  const transaction = transactionsStore.get(`ref_${externalRef}`);

  if (transaction) {
    console.log("[Supabase] Transação encontrada:", transaction.transaction_id);
    return transaction;
  }

  // Fallback: buscar em todas as transações
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
  console.log(
    "[Supabase] Atualizando status da transação:",
    transactionId,
    "->",
    status
  );

  const transaction = transactionsStore.get(transactionId);

  if (!transaction) {
    console.log(
      "[Supabase] Transação não encontrada para atualizar:",
      transactionId
    );
    return null;
  }

  const now = new Date().toISOString();
  const updatedTransaction: Transaction = {
    ...transaction,
    status,
    updated_at: now,
    paid_at: paidAt || transaction.paid_at,
  };

  transactionsStore.set(transactionId, updatedTransaction);

  console.log("[Supabase] Transação atualizada com sucesso:", transactionId);
  return updatedTransaction;
}

/**
 * Lista todas as transações (para debug)
 */
export async function listTransactions(): Promise<Transaction[]> {
  const transactions: Transaction[] = [];

  for (const [key, value] of transactionsStore.entries()) {
    // Evitar duplicatas (entries com ref_)
    if (!key.startsWith("ref_")) {
      transactions.push(value);
    }
  }

  return transactions;
}
