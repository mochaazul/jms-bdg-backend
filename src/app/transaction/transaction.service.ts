import { CashFlow } from '@entity/cashFlow'
import { Customer } from '@entity/customer'
import { CustomerMonetary } from '@entity/customerMonetary'
import { Stock } from '@entity/stock'
import { StockToko } from '@entity/stockToko'
import { Transaction } from '@entity/transaction'
import { TransactionDetail } from '@entity/transactionDetail'
import { User } from '@entity/user'
import _ from 'lodash'
import { db } from 'src/app'
import { E_ERROR } from 'src/constants/errorTypes'
import { TRANSACTION_STATUS } from 'src/constants/languageEnums'
import {
  E_CashFlowCode, E_CashFlowType, E_CashType
} from 'src/database/enum/cashFlow'
import { E_Recievables } from 'src/database/enum/hutangPiutang'
import { E_TransactionStatus } from 'src/database/enum/transaction'
import { Errors } from 'src/errorHandler'
import { stockDeductor } from 'src/helper/stockHelper'
import { E_TOKO_CODE_KEY } from 'src/interface/StocksCode'
import { getCustomerDebtService, getCustomerDepositService } from '../customer/customer.service'
import {
  formatTransaction, restoreStocks, TransactionProcessor
} from './transaction.helper'
import {
  DeleteTransactionItemRequestParameter, TransactionDetailRequestParameter, TransactionRequestParameter, TransactionUpdateRequestParameter
} from './transaction.interface'

export type T_Sort = 'DESC' | 'ASC' | 1 | -1 | undefined

export const getAllTransactionService = async ( sort: string = 'DESC' ) => {
  try {
    const order = sort as T_Sort
    const transactions = await Transaction.find( {
      order    : { updated_at: order },
      where    : { status: E_TransactionStatus.FINISHED },
      relations: [
        'customer',
        'cashier',
        'transactionDetails',
        'transactionDetails.stock',
        'transactionDetails.stock.product',
        'transactionDetails.stock.product.vendor'
      ]
    } )
    return formatTransaction( transactions )
  } catch ( error: any ) {
    return await Promise.reject( new Errors( error ) )
  }
}

export const createTransactionService = async ( payload: TransactionRequestParameter, isPending: boolean = false, user?: User ) => {
  const queryRunner = db.queryRunner()
  try {
    await queryRunner.startTransaction()
    const customer = await Customer.findOne( { where: { id: payload.customer_id } } )
    const customerDeposit = customer ? ( await getCustomerDepositService( customer.id ) ).total_deposit : 0
    // getCustomerDebtService with condition is_pay_debt

    const stocks = await Stock.find( { relations: ['product', 'product.vendor'] } )

    const expected_total_price = 0

    const transactionDetails = await Promise.all( payload.detail.map( async transactionDetail => {
      const stock = stocks.find( product => product.id === transactionDetail.stock_id )
      if ( stock == null ) throw E_ERROR.PRODUCT_NOT_FOUND

      const detail = new TransactionDetail()
      detail.amount = transactionDetail.amount
      detail.sub_total = transactionDetail.sub_total
      detail.stock_id = transactionDetail.stock_id
      detail.stock = stock
      detail.is_box = transactionDetail.box
      return detail
    } ) )

    const stockSync = await Promise.all( payload.detail.map( async detail => {
      const stockHelper = await stockDeductor( detail.stock_id, detail.amount, detail.box )

      await queryRunner.manager.save( stockHelper.entity )

      return stockHelper.stock
    } ) )

    // passing customer debt here
    const transactionProcess = new TransactionProcessor(
      payload, customer, transactionDetails, expected_total_price, customerDeposit, isPending, payload.pay_debt, user
    )
 
    await queryRunner.manager.save( stockSync )
    await transactionProcess.start()

    if ( payload.amount_paid ) {
      const cashFlow = new CashFlow()
      cashFlow.amount = payload.amount_paid < payload.actual_total_price ? payload.amount_paid : payload.actual_total_price
      cashFlow.code = E_CashFlowCode.IN_TRANSACTION
      cashFlow.transaction_id = transactionProcess.transaction.id
      cashFlow.type = E_CashFlowType.CashIn
      cashFlow.cash_type = payload.is_transfer ? E_CashType.TRANSFER : E_CashType.CASH
      cashFlow.note = 'Penjualan produk' + `${payload.pay_debt ? ' & Bayar Kasbon' : ''}` // temporary harcode
      await queryRunner.manager.save( cashFlow )
    }

    await queryRunner.commitTransaction()

    return {
      transaction: formatTransaction( [transactionProcess.transaction] ),
      customer   : {
        ...transactionProcess.transaction.customer,
        deposit_balance: transactionProcess.transaction.customer ? ( await getCustomerDepositService( transactionProcess.transaction?.customer?.id ) ).total_deposit : 0,
        debt_balance   : transactionProcess.transaction.customer ? ( await getCustomerDebtService( transactionProcess.transaction?.customer?.id ) ).total_debt : 0
      }
    }
  } catch ( error: any ) {
    await queryRunner.rollbackTransaction()
    return await Promise.reject( new Errors( error ) )
  } finally {
    await queryRunner.release()
  }
}

export const updatePendingTransactionService = async ( transaction_id: string, items: TransactionDetailRequestParameter[] ) => {
  const queryRunner = db.queryRunner()
  try {
    await queryRunner.startTransaction()
    
    const transaction = await Transaction.findOne( { where: { id: transaction_id }, relations: ['transactionDetails', 'transactionDetails.stock'] } )
    if ( !transaction ) throw E_ERROR.TRANSACTION_NOT_FOUND

    const transactionDetailsIds = transaction.transactionDetails.map( detail => detail.stock_id )
    const payloadStockIds = items.map( item => item.stock_id )

    const updateData = await Promise.all( transaction.transactionDetails.filter( detail => payloadStockIds.includes( detail.stock_id ) ).map(
      async transactionDetail => {
        const masterStock = await Stock.findOneOrFail( transactionDetail.stock_id )
        const payload = items.find( item => item.stock_id === transactionDetail.stock_id )
        const stockToko = new StockToko()
        if ( !payload ) throw E_ERROR.STOCK_NOT_FOUND

        if ( payload.amount === transactionDetail.amount ) return transactionDetail

        if ( payload.amount > transactionDetail.amount ) {
          masterStock.stock_toko -= payload.amount - transactionDetail.amount
          stockToko.amount = payload.amount - transactionDetail.amount
          stockToko.code = E_TOKO_CODE_KEY.TOK_SUB_BRG_PENDING_TRANSAKSI
        }
        
        if ( payload.amount < transactionDetail.amount ) {
          masterStock.stock_toko += transactionDetail.amount - payload.amount
          stockToko.amount = transactionDetail.amount - payload.amount
          stockToko.code = E_TOKO_CODE_KEY.TOK_ADD_BRG_PENDING_TRANSAKSI
        }

        transactionDetail.amount = payload.amount
        transactionDetail.sub_total = payload.sub_total
        stockToko.stock_id = payload.stock_id
        await queryRunner.manager.save( stockToko )
        await queryRunner.manager.save( masterStock )
        return transactionDetail
      }
    ) )

    const deleteData = await Promise.all( transaction.transactionDetails.filter( detail => !payloadStockIds.includes( detail.stock_id ) ).map(
      async transactionDetail => {
        const masterStock = await Stock.findOneOrFail( transactionDetail.stock_id )
        masterStock.stock_toko += transactionDetail.amount
        const stockToko = new StockToko()
        stockToko.amount = transactionDetail.amount
        stockToko.code = E_TOKO_CODE_KEY.TOK_ADD_BRG_PENDING_TRANSAKSI
        stockToko.stock_id = transactionDetail.stock_id

        await queryRunner.manager.save( stockToko )
        await queryRunner.manager.save( masterStock )
        return transactionDetail
      }
    ) )

    const insertData = await Promise.all( items.filter( item => !transactionDetailsIds.includes( item.stock_id ) ).map( async item => {
      const transactionDetail = new TransactionDetail()
      transactionDetail.amount = item.amount
      transactionDetail.sub_total = item.sub_total
      transactionDetail.stock_id = item.stock_id
      const masterStock = await Stock.findOneOrFail( item.stock_id )
      masterStock.stock_toko -= item.amount
      const stockToko = new StockToko()
      stockToko.amount = item.amount
      stockToko.code = E_TOKO_CODE_KEY.TOK_SUB_BRG_PENDING_TRANSAKSI
      stockToko.stock_id = item.stock_id

      await queryRunner.manager.save( stockToko )
      await queryRunner.manager.save( masterStock )
      return transactionDetail
    } ) )

    await queryRunner.manager.save( updateData )
    await queryRunner.manager.remove( deleteData )
    await queryRunner.manager.save( insertData )

    await queryRunner.commitTransaction()
  } catch ( error: any ) {
    await queryRunner.rollbackTransaction()
    return await Promise.reject( new Errors( error ) )
  } finally {
    await queryRunner.release()
  }
}

export const deletePendingTransactionService = async ( id: string ) => {
  const transaction = await Transaction.findOne( id )
  if ( !transaction ) throw E_ERROR.TRANSACTION_NOT_FOUND

  const transactionItems = transaction.transactionDetails

  if ( transactionItems.length > 0 ) {
    await restoreStocks( transactionItems )
  }

  transaction.status = E_TransactionStatus.VOID
  await transaction.save()
  return transaction
}

export const deletePendingTransactionItemService = async ( payload: DeleteTransactionItemRequestParameter ) => {
  const transactionItem = await TransactionDetail.findOne( {
    where: {
      transaction_id: payload.transaction_id,
      stock_id      : payload.stock_id
    }
  } )

  if ( !transactionItem ) throw E_ERROR.STOCK_NOT_FOUND

  await restoreStocks( [transactionItem] )
 
  return transactionItem
}

export const searchTransactionService = async ( query?: string, id?: string ) => {
  try {
    const transactions = await await Transaction.find( {
      relations: [
        'customer',
        'transactionDetails',
        'transactionDetails.product',
        'transactionDetails.product.stock',
        'transactionDetails.product.stock.vendor'
      ],
      where: id ? { id } : {}
    } )
    if ( _.isEmpty( transactions ) ) throw E_ERROR.TRANSACTION_NOT_FOUND
    return transactions
  } catch ( error: any ) {
    return await Promise.reject( new Errors( error ) )
  }
}

export const updateTransactionService = async ( id: string, payload: TransactionUpdateRequestParameter ) => {
  const queryRunner = db.queryRunner()
  try {
    await queryRunner.startTransaction()
    const transaction = await Transaction.findOne( { where: { id } } )
    const customer = await Customer.findOne( { where: { id: payload.customer_id } } )
    if ( !transaction ) throw E_ERROR.TRANSACTION_NOT_FOUND
    if ( !customer ) throw E_ERROR.CUSTOMER_NOT_FOUND

    let actual_total_price = 0

    transaction.transactionDetails.map( detail => {
      const pd = payload.detail.find( detailPayload => detailPayload.id === detail.id )
      if ( pd ) {
        detail.amount = pd.amount ?? detail.amount
        // detail.product_id = pd.productId ?? detail.product_id
        detail.sub_total = pd.sub_total ?? detail.sub_total
        actual_total_price += detail.sub_total
        return detail
      }

      return detail
    } )

    if ( payload.amount_paid && payload.amount_paid < actual_total_price ) {
      transaction.status = TRANSACTION_STATUS.PENDING
      transaction.outstanding_amount = actual_total_price - payload.amount_paid

      // TODO : NEED TO CHECK MONETARY LOGIC
      const customerMonet = new CustomerMonetary()
      customerMonet.customer = customer
      customerMonet.amount = transaction.outstanding_amount
      customerMonet.type = E_Recievables.DEBT
      await queryRunner.manager.save( customerMonet )
    } else {
      transaction.status = TRANSACTION_STATUS.PAID
      transaction.change = payload.amount_paid ? payload.amount_paid - actual_total_price : transaction.change
    }

    transaction.expected_total_price = payload.expected_total_price ?? transaction.expected_total_price
    transaction.actual_total_price = payload.actual_total_price ?? transaction.actual_total_price
    transaction.transaction_date = payload.transaction_date ?? transaction.transaction_date
    transaction.amount_paid = payload.amount_paid ?? transaction.amount_paid
    
    await queryRunner.manager.save( transaction )
    await queryRunner.commitTransaction()
    return await Transaction.findOne( { where: { id } } )
  } catch ( error: any ) {
    return await Promise.reject( new Errors( error ) )
  } finally {
    await queryRunner.release()
  }
}

export const getTransactionByIdService = async ( id: string ) => {
  try {
    const transaction = await Transaction.findOne( { where: { id }, relations: ['customer', 'transactionDetails'] } )
    if ( !transaction ) throw E_ERROR.TRANSACTION_NOT_FOUND
    return transaction
  } catch ( error: any ) {
    return await Promise.reject( new Errors( error ) )
  }
}

export const deleteTransactionService = async ( id: string ) => {
  try {
    const transaction = await Transaction.findOneOrFail( { where: { id } } )
    await transaction.remove()
    return { message: 'Transaction is deleted!' }
  } catch ( error: any ) {
    return await Promise.reject( new Errors( error ) )
  }
}
