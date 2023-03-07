/* eslint-disable @typescript-eslint/no-unused-vars */
import { CashFlow } from '@entity/cashFlow'
import { Transaction } from '@entity/transaction'
import dayjs, { Dayjs } from 'dayjs'
import { DateFormat } from 'src/constants/date'
import { E_CashFlowCode, E_CashType } from 'src/database/enum/cashFlow'
import { E_TransactionStatus } from 'src/database/enum/transaction'
import { Raw } from 'typeorm'
import { sumOf } from './report.helper'

interface DailyReportResponse {
  total: {
    transfer: number
    cash: number
  }
  items: CashFlowResponseItem[]
}
interface CashFlowResponseItem {
  id: number
  note: string
  type: string
  sub_total_cash: number
  sub_total_transfer: number
}

export const getDailyReportService = async ( date: Dayjs ) => {
  const transactions = await Transaction.find( { where: { status: E_TransactionStatus.FINISHED }, relations: ['customer'] } )
  const cashFlow = await CashFlow.createQueryBuilder( )
    .where( 'Date(CashFlow.created_at) = current_date' )
    .andWhere( 'CashFlow.code = :type', { type: E_CashFlowCode.IN_ADJUSTMENT } )
    .getMany()
  const todayTransaction = transactions.filter( transaction => dayjs( transaction?.transaction_date ).format( DateFormat ) === date.format( DateFormat ) )
  const yesterdayTransaction = transactions.filter( transactions => dayjs( transactions?.transaction_date ).format( DateFormat ) === date.subtract( 1, 'day' ).format( DateFormat ) )

  const cashFlowFormatted: CashFlowResponseItem[] = cashFlow.map( cf => {
    return {
      id                : cf.id,
      note              : cf.note,
      type              : cf.cash_type,
      sub_total_cash    : cf.cash_type === 'cash' ? cf.amount : 0,
      sub_total_transfer: cf.cash_type === 'transfer' ? cf.amount : 0
    }
  } )
  const transactionFormatted: CashFlowResponseItem[] = todayTransaction.map( transaction => {
    return {
      id                : transaction.id,
      note              : transaction.customer?.name ?? '',
      type              : transaction.is_transfer ? E_CashType.TRANSFER : E_CashType.TRANSFER,
      sub_total_cash    : !transaction.is_transfer ? transaction.actual_total_price : 0,
      sub_total_transfer: transaction.is_transfer ? transaction.actual_total_price : 0
    }
  } )

  const yesterdayTransactionFormatted: CashFlowResponseItem = yesterdayTransaction.map( transaction => ( {
    id                : transaction.id,
    note              : 'Stock Tunai (Total transaksi H-1)',
    type              : `${E_CashType.CASH} / ${E_CashType.TRANSFER}`,
    sub_total_cash    : !transaction.is_transfer ? transaction.actual_total_price : 0,
    sub_total_transfer: transaction.is_transfer ? transaction.actual_total_price : 0
  } ) ).reduce( ( acc, curr ) => {
    return {
      id                : curr.id,
      note              : 'Stock Tunai (Total transaksi H-1)',
      type              : curr.type,
      sub_total_cash    : acc.sub_total_cash + curr.sub_total_cash,
      sub_total_transfer: acc.sub_total_transfer + curr.sub_total_transfer
    }
  } )
  
  return {
    yesterdayTransaction: yesterdayTransactionFormatted,
    todayTransaction    : [...cashFlowFormatted, ...transactionFormatted]
  }
}