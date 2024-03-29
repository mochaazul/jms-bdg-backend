import { Product } from '@entity/product'
import { Stock } from '@entity/stock'
import { StockGudang } from '@entity/stockGudang'
import { StockToko } from '@entity/stockToko'
import { db } from 'src/app'
import { E_ERROR } from 'src/constants/errorTypes'
import { Errors } from 'src/errorHandler'
import { E_GUDANG_CODE_KEY, E_TOKO_CODE_KEY } from 'src/interface/StocksCode'
import { PindahStockGudangRequestParameter, TambahStockGudangRequestParameter } from './gudang.interface'

export const getStockGudangService = async () => {
  try {
    const stocks = await StockGudang.find( {
      relations: [
        'stock',
        'stock.product',
        'stock.product.vendor'
      ]
    } )
    return stocks
  } catch ( error: any ) {
    return await Promise.reject( new Errors( error ) )
  }
}

export const pindahStockGudangService = async ( payload: PindahStockGudangRequestParameter[] ) => {
  const queryRunner = db.queryRunner()
  try {
    await queryRunner.startTransaction()
    const stocks_gudang = payload.map( item => {
      const stock = new StockGudang()
      stock.amount = item.amount
      stock.stock_id = item.stock_id
      stock.code = E_GUDANG_CODE_KEY.GUD_SUB_BRG_PIN_TOKO
      return stock
    } )

    const stocks_toko = await Promise.all( payload.map( async item => {
      const stock = await Stock.findOneOrFail( item.stock_id )
      const item_toko = new StockToko()
      item_toko.code = E_TOKO_CODE_KEY.TOK_ADD_BRG_MASUK
      item_toko.stock_id = item.stock_id
      item_toko.amount = stock?.weight * item.amount
      return item_toko
    } ) )

    // const updateStockGudangOnStockTable = await Promise.all( payload.map( async stock => {
    //   // append dari stock gudang yg di database, dan yang baru di add dari payload
    //   const stockGudang = [...await StockGudang.find( { where: { stock_id: stock.stock_id } } ), ...stocks_gudang]
    //   const stockData = await Stock.findOneOrFail( stock.stock_id )
    //   stockData.stock_gudang = CalculateTotalStock( stockGudang )
    //   return stockData
    // } ) )

    const updateStockValue = await Promise.all( payload.map( async item => {
      const stockData = await Stock.findOneOrFail( item.stock_id )
      const amountStock = item.amount * stockData.weight
      const currentStockToko = stockData.stock_toko
      const resultStockToko = Number( currentStockToko ?? 0 ) + amountStock
      stockData.stock_gudang -= item.amount
      stockData.stock_toko = resultStockToko
      return stockData
    } ) )

    const hasMinusStock = updateStockValue.some( stock => stock.stock_gudang < 0 )
    if ( hasMinusStock ) throw E_ERROR.INSUFFICIENT_STOCK_GDG

    await queryRunner.manager.save( stocks_gudang )
    await queryRunner.manager.save( stocks_toko )
    await queryRunner.manager.save( updateStockValue )

    await queryRunner.commitTransaction()
    return stocks_gudang
  } catch ( error: any ) {
    await queryRunner.rollbackTransaction()
    await Promise.reject( new Errors( error ) )
  } finally {
    await queryRunner.release()
  }
}

export const tambahStockGudangService = async ( payload: TambahStockGudangRequestParameter ) => {
  const queryRunner = db.queryRunner()

  try {
    await queryRunner.startTransaction()
    const isProductExists = await Product.find( { where: [{ id: payload.product_id }, { vendorId: payload.vendor_id }] } )
    if ( !isProductExists.length ) throw E_ERROR.PRODUCT_NOT_FOUND_ONDB
    const stock = new Stock()
    stock.buy_price = payload.buy_price
    stock.sell_price = payload.sell_price
    stock.stock_gudang = payload.box_amount

    const stockGudangs = []

    for ( let brg = 0; brg < payload.box_amount; brg++ ) {
      const stockGudang = new StockGudang()
      stockGudang.amount = 1
      stockGudang.code = E_GUDANG_CODE_KEY.GUD_ADD_BRG_MASUK
      stockGudang.stock_id = stock.id
      stockGudangs.push( stockGudang )
    }

    await queryRunner.manager.save( stock )
    await queryRunner.manager.save( stockGudangs )
    await queryRunner.commitTransaction()

    return stock
  } catch ( error: any ) {
    await queryRunner.rollbackTransaction()
    return await Promise.reject( new Errors( error ) )
  } finally {
    await queryRunner.release()
  }
}
