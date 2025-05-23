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
exports.Stock = void 0;
const typeorm_1 = require("typeorm");
const product_1 = require("./product");
const transactionDetail_1 = require("./transactionDetail");
const vendor_1 = require("./vendor");
let Stock = class Stock extends typeorm_1.BaseEntity {
    id;
    stock_toko;
    stock_gudang;
    buy_price;
    sell_price;
    weight;
    vendor;
    product;
    productId;
    transactionDetails;
    created_at;
    updated_at;
    deleted_at;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Stock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        nullable: true,
        precision: 6,
        scale: 2
    }),
    __metadata("design:type", Number)
], Stock.prototype, "stock_toko", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Stock.prototype, "stock_gudang", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Stock.prototype, "buy_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Stock.prototype, "sell_price", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 6,
        scale: 2,
        nullable: true
    }),
    __metadata("design:type", Number)
], Stock.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_1.Vendor, vendor => vendor.products, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'vendorId' }),
    __metadata("design:type", vendor_1.Vendor)
], Stock.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_1.Product, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_1.Product)
], Stock.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Stock.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transactionDetail_1.TransactionDetail, transactionDetail => transactionDetail.stock),
    __metadata("design:type", Array)
], Stock.prototype, "transactionDetails", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Stock.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Stock.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Stock.prototype, "deleted_at", void 0);
Stock = __decorate([
    (0, typeorm_1.Entity)({ name: 'stock' })
], Stock);
exports.Stock = Stock;
