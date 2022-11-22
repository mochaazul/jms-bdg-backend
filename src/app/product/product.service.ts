import { Product } from '@entity/product'
import { Stock } from '@entity/stock'
import { Vendor } from '@entity/vendor'
import { E_ERROR } from 'src/constants/errorTypes'
import makeResponse from 'src/helper/response'
import { Errors } from '../../errorHandler'
import { ProductRequestParameter } from './product.interfaces'

export const getAllProductsService = async () => {
  try {
    const products = await Product.find( { relations: ['stocks', 'vendor'] } )
    return makeResponse.success<Product[]>( { data: products, stat_msg: 'SUCCESS' } )
  } catch ( e: any ) {
    throw new Errors( e )
  }
}

export const createProductService = async ( payload: ProductRequestParameter[] ) => {
  try {
    const new_products = await Promise.all( payload.map( async product => {
      const vendor = await Vendor.findOne( { where: { id: product.vendorId } } )

      if ( vendor == null ) throw E_ERROR.NOT_FOUND
      const stock = new Stock()
      stock.buy_price = product.hargaModal
      stock.sell_price = product.hargaJual
      stock.stock_gudang = product.stok
  
      const newProduct = new Product()
      newProduct.sku = product.sku
      newProduct.name = product.name
      newProduct.arrival_date = product.tanggalMasuk
      newProduct.stocks = [stock]

      return newProduct
    } ) )

    await Product.save( new_products )

    return new_products
  } catch ( e: any ) {
    throw new Errors( e )
  }
}

export const searchProductService = async ( { query }: { query: string } ) => {
  try {
    const products = await Product.createQueryBuilder( 'product' )
      .where( 'product.sku LIKE :query OR product.name LIKE :query', { query: `%${query}%` } )
      .leftJoinAndSelect( 'product.stock', 'stock' )
      .leftJoinAndSelect( 'stock.vendor', 'vendor' )
      .orderBy( 'product.id', 'ASC' )
      .getMany()
    return makeResponse.success<Product[]>( { data: products, stat_msg: 'SUCCESS' } )
  } catch ( e: any ) {
    throw new Errors( e )
  }
}

export const updateProductService = async ( id: number, payload: ProductRequestParameter ) => {
  try {
    const _updatedProduct = await Product.findOne( { where: { id } } )
    const _updatedStock = await Stock.findOne( { where: { productId: id } } )
    if ( _updatedStock == null ) { throw E_ERROR.STOCK_NOT_FOUND }
    _updatedStock.buy_price = payload.hargaModal
    _updatedStock.sell_price = payload.hargaJual
    _updatedStock.stock_toko = payload.stok

    if ( _updatedProduct == null ) { throw E_ERROR.PRODUCT_NOT_FOUND }
    _updatedProduct.name = payload.name
    _updatedProduct.sku = payload.sku
    _updatedProduct.arrival_date = payload.tanggalMasuk
    _updatedProduct.stocks = [_updatedStock]
  
    await _updatedProduct.save()
    return await Product.findOne( { where: { id } } )
  } catch ( e: any ) {
    throw new Errors( e )
  }
}

export const deleteProductService = async ( { id }: { id: number } ) => {
  try {
    const _deletedProduct = await Product.findOne( { where: { id } } )
    if ( _deletedProduct == null ) throw E_ERROR.PRODUCT_NOT_FOUND
    await _deletedProduct.remove()
    return { message: 'Product is deleted!' }
  } catch ( e: any ) {
    throw new Errors( e )
  }
}
