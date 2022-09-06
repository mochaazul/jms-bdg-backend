import {
  Body, Controller, Delete, Get, Path, Post, Put, Query, Route, Security, Tags
} from 'tsoa'
import {
  createCustomerService, deleteCustomerService, getAllCustomerService, getCustomerByIdService, searchCustomerService, updateCustomerService
} from './customer.service'
import { CustomerRequestParameter, CustomerUpdateRequestParameter } from './customer.interface'
import makeResponse from 'src/helper/response'
import { Errors } from 'src/errorHandler'

@Tags( 'Customer' )
@Route( '/api/customer' )

export class CustomerController extends Controller {
  @Get( '/' )
  @Security( 'api_key', ['read:customer'] )
  public async getAllCustomer () {
    try {
      const customer = await getAllCustomerService()
      return makeResponse.success( { data: customer } )
    } catch ( error: any ) {
      return new Errors( error )
    }
  }

  @Get( '/detail/{id}' )
  @Security( 'api_key', ['read:customer'] )
  public async findCustomerById ( @Path() id: string ) {
    try {
      const customer = await getCustomerByIdService( id )
      return makeResponse.success( { data: customer } )
    } catch ( error: any ) {
      return error
    }
  }

  @Get( '/search/' )
  @Security( 'api_key', ['read:customer'] )
  public async searchCustomer ( @Query( 'query' ) query: string ) {
    try {
      const customer = await searchCustomerService( query )
      return makeResponse.success( { data: customer } )
    } catch ( error: any ) {
      return error
    }
  }

  @Post( '/' )
  @Security( 'api_key', ['create:customer'] )
  public async createCustomer ( @Body() payload: CustomerRequestParameter ) {
    return await createCustomerService( payload )
  }

  @Put( '/{id}/' )
  @Security( 'api_key', ['update:customer'] )
  public async updateCustomer ( @Path() id: string, @Body() payload: CustomerUpdateRequestParameter ) {
    try {
      const customer = await updateCustomerService( id, payload )
      return makeResponse.success( { data: customer } )
    } catch ( error: any ) {
      return error
    }
  }

  @Delete( '/{id}/' )
  @Security( 'api_key', ['delete:customer'] )
  public async deleteCustomer ( @Path() id: string ) {
    try {
      await deleteCustomerService( id )
      return makeResponse.success( { data: {} } )
    } catch ( error: any ) {
      return error
    }
  }
}
