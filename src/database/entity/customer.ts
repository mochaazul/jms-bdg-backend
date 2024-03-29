import {
  BaseEntity, Column, CreateDateColumn, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm'
import { CustomerMonetary } from './customerMonetary'
import { Transaction } from './transaction'
import { CashFlow } from './cashFlow'

@Entity( 'customer' )
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    name!: string

  @Column()
    contact_number: string

  @OneToMany( () => CustomerMonetary, ( deposit: CustomerMonetary ) => deposit.customer, { onDelete: 'CASCADE' } )
    monetary: CustomerMonetary[]

  @OneToMany( () => Transaction, ( transaction: Transaction ) => transaction.customer, { onDelete: 'CASCADE' } )
  @JoinTable()
    transactions: Transaction[]

  @OneToMany( () => CashFlow, ( transaction: Transaction ) => transaction.customer, { onDelete: 'CASCADE' } )
  @JoinTable()
    cashFlows: CashFlow[]

  @CreateDateColumn()
    created_at: Date

  @UpdateDateColumn()
    updated_at: Date
}
