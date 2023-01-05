"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockTokoSubscriber = void 0;
const stock_1 = require("@entity/stock");
const stockToko_1 = require("@entity/stockToko");
const StocksCode_1 = require("src/interface/StocksCode");
const typeorm_1 = require("typeorm");
let StockTokoSubscriber = class StockTokoSubscriber {
    /**
       * Indicates that this subscriber only listen to StockGudang events.
       */
    listenTo() {
        return stockToko_1.StockToko;
    }
    /**
       * Called before post insertion.
       */
    afterinsert(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const stock = yield stock_1.Stock.findOne(event.entity.stock_id);
            if (stock &&
                (event.entity.code === StocksCode_1.E_TOKO_CODE_KEY.TOK_ADD_BRG_MASUK ||
                    event.entity.code === StocksCode_1.E_TOKO_CODE_KEY.TOK_SUB_BRG_RETUR)) {
                stock.stock_toko = stock.stock_toko + event.entity.amount;
                yield stock.save();
            }
            if (stock && event.entity.code === StocksCode_1.E_TOKO_CODE_KEY.TOK_SUB_TRANSAKSI) {
                stock.stock_toko = stock.stock_toko - event.entity.amount;
                yield stock.save();
            }
        });
    }
};
StockTokoSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], StockTokoSubscriber);
exports.StockTokoSubscriber = StockTokoSubscriber;
