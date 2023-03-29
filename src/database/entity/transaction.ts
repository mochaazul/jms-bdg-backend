import {
  BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm'
import { Customer } from './customer'
import { CustomerMonetary } from './customerMonetary'
import { TransactionDetail } from './transactionDetail'
import { User } from './user'

@Entity( { name: 'transaction' } )
export class Transaction extends BaseEntity {
  @BeforeInsert()
  generateTransactionId () {
    // console.log( this )
  }

  @PrimaryGeneratedColumn()
    id: number

  @Column( { nullable: true } )
    transaction_id: string

  @Column()
    expected_total_price: number

  @Column()
    actual_total_price: number

  @Column( { nullable: true } )
    amount_paid: number

  @Column( { nullable: true } )
    change: number

  @Column( { nullable: true } )
    outstanding_amount: number

  @Column( { nullable: true } )
    optional_discount?: number

  @Column( { nullable: true } )
    description?: string

  @ManyToOne( () => Customer, ( customer: Customer ) => customer.id, { onDelete: 'CASCADE', nullable: true } )
  @JoinColumn( { name: 'customer_id' } )
    customer?: Customer

  @OneToMany( () => TransactionDetail, ( transactionDetail: TransactionDetail ) => transactionDetail.transaction, { cascade: true, onDelete: 'CASCADE' } )
  @JoinColumn()
    transactionDetails: TransactionDetail[]

  @Column( { nullable: true } )
    packaging_cost?: number

  @Column()
    status: string

  @Column( { nullable: true } )
    customer_id: number

  @Column( {
    type: 'timestamp', default: () => 'now()', nullable: true
  } )
    transaction_date?: Date

  @OneToMany( () => CustomerMonetary, ( customerMonetary: CustomerMonetary ) => customerMonetary.transaction, { onDelete: 'CASCADE' } )
  @JoinColumn()
    customerMonetary: CustomerMonetary[]

  @ManyToOne( () => User, user => user.transactions, { nullable: true } )
    cashier?: User

  @Column( { nullable: true } )
    deposit?: number

  @Column( { nullable: true } )
    is_transfer?: boolean

  @Column( { nullable: true } )
    remaining_deposit: number

  @Column( { nullable: true } )
    usage_deposit: number

  @CreateDateColumn()
    created_at: Date

  @UpdateDateColumn()
    updated_at: Date
}
