import { Stock } from '@entity/stock'
import { StockGudang } from '@entity/stockGudang'
import { StockToko } from '@entity/stockToko'
import { E_ERROR } from 'src/constants/errorTypes'
import { E_GUDANG_CODE_KEY, E_TOKO_CODE_KEY } from 'src/interface/StocksCode'

interface I_StockDeductorReturn {
  entity: StockToko | StockGudang
  stock: Stock
}

type I_StockDeductor = ( stock_id: number, amount: number, is_gudang?: boolean, isPendingUpdate?: boolean, existStock?: number ) => Promise<I_StockDeductorReturn>

const isAddition = ( source: string ) => {
  return source.includes( '_ADD_' )
}

export const isSubtraction = ( source: string ) => {
  return source.includes( '_SUB_' )
}

export const CalculateTotalStock = ( stock: StockGudang[] | StockToko[] ): number => {
  const total = stock.reduce( ( acc, cur ) => {
    if ( isAddition( cur.code ) ) return acc + cur.amount
    return acc - cur.amount
  }, 0 )
  return total
}

const getDeductedStock = ( stock: number, isPendingUpdate?: boolean, existStock?: number ): number => {
  if ( isPendingUpdate ) {
    return Number( stock ) + Number( existStock ?? 0 )
  }

  return Number( stock )
}

export const stockDeductor: I_StockDeductor = async ( stock_id, amount, is_gudang, isPendingUpdate, existStock ) => {
  const stock = await Stock.findOneOrFail( stock_id )
  
  if ( is_gudang && getDeductedStock( stock.stock_gudang, isPendingUpdate, existStock ) - amount < 0 ) {
    throw E_ERROR.INSUFFICIENT_STOCK
  }

  if ( is_gudang ) {
    const stock_gudang = new StockGudang()
    stock_gudang.amount = amount
    stock_gudang.code = E_GUDANG_CODE_KEY.GUD_SUB_BRG_TRANSAKSI
    stock_gudang.stock_id = stock_id
    stock.stock_gudang = getDeductedStock( stock.stock_gudang, isPendingUpdate, existStock ) - amount
    return {
      entity: stock_gudang,
      stock
    }
  }

  if ( getDeductedStock( stock.stock_toko, isPendingUpdate, existStock ) - Number( amount ) < 0 ) {
    throw E_ERROR.INSUFFICIENT_STOCK
  }
  stock.stock_toko = getDeductedStock( stock.stock_toko, isPendingUpdate, existStock ) - amount
    
  // Add deduction record into stock_toko
  const stock_toko = new StockToko()
  stock_toko.amount = amount
  stock_toko.code = E_TOKO_CODE_KEY.TOK_SUB_TRANSAKSI
  stock_toko.stock_id = stock_id
  return {
    entity: stock_toko,
    stock
  }
}

export const parseSKU = ( skuStockId: string ) => {
  const [sku, stockId] = skuStockId.split( '@' )
  return {
    sku,
    stockId
  }
}
