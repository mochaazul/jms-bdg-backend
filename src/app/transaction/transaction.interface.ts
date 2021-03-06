import { Transaction } from "@entity/transaction";

export type TransactionRequestParameter = {
  expected_total_price: number;
  actual_total_price: number;
  customer_id: number;
  detail: {
    amount: number;
    final_price: number;
    productId: string;
    sub_total: number;
  }[]
};

export type Transactionss = {
  transaction : Transaction
}