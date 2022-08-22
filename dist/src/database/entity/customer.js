"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const typeorm_1 = require("typeorm");
const customerDeposit_1 = require("./customerDeposit");
const transaction_1 = require("./transaction");
let Customer = class Customer extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Customer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Customer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Customer.prototype, "contact_number", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customerDeposit_1.CustomerDeposit, (deposit) => deposit.customer, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Customer.prototype, "deposits", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_1.Transaction, (transaction) => transaction.customer, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Customer.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Customer.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Customer.prototype, "updated_at", void 0);
Customer = __decorate([
    (0, typeorm_1.Entity)('customer')
], Customer);
exports.Customer = Customer;
