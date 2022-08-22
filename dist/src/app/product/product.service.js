"use strict";
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
exports.deleteProductService = exports.updateProductService = exports.searchProductService = exports.createProductService = exports.getAllProductsService = void 0;
const product_1 = require("@entity/product");
const stock_1 = require("@entity/stock");
const vendor_1 = require("@entity/vendor");
const enums_1 = require("src/errorHandler/enums");
const errorHandler_1 = require("../../errorHandler");
const getAllProductsService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield product_1.Product.find({
            relations: ["stock", 'stock.vendor']
        });
    }
    catch (e) {
        console.log(e);
        throw new errorHandler_1.ErrorHandler(e);
    }
});
exports.getAllProductsService = getAllProductsService;
const createProductService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendor = yield vendor_1.Vendor.findOne({ where: { id: payload.vendorId } });
        if (!vendor)
            throw enums_1.E_ErrorType.E_VENDOR_NOT_FOUND;
        const stock = new stock_1.Stock();
        stock.buy_price = payload.hargaModal;
        stock.sell_price = payload.hargaJual;
        stock.total_stock = payload.stok;
        stock.vendorId = payload.vendorId;
        const newProduct = new product_1.Product();
        newProduct.sku = payload.sku;
        newProduct.name = payload.name;
        newProduct.arrival_date = payload.tanggalMasuk;
        newProduct.stock = stock;
        yield newProduct.save();
        return newProduct;
    }
    catch (e) {
        console.log(e);
        throw new errorHandler_1.ErrorHandler(e);
    }
});
exports.createProductService = createProductService;
const searchProductService = ({ query }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield product_1.Product.createQueryBuilder('product')
            .where('product.sku LIKE :query OR product.name LIKE :query', { query: `%${query}%` })
            .orderBy('product.id', 'ASC')
            .getMany();
    }
    catch (e) {
        throw new errorHandler_1.ErrorHandler(e);
    }
});
exports.searchProductService = searchProductService;
const updateProductService = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _updatedProduct = yield product_1.Product.findOne({ where: { id } });
        if (!_updatedProduct)
            throw enums_1.E_ErrorType.E_PRODUCT_NOT_FOUND;
        _updatedProduct['name'] = payload.name;
        yield _updatedProduct.save();
        return yield product_1.Product.findOne({
            where: { id: id }
        });
    }
    catch (e) {
        throw new errorHandler_1.ErrorHandler(e);
    }
});
exports.updateProductService = updateProductService;
const deleteProductService = ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _deletedProduct = yield product_1.Product.findOne({ where: { id } });
        if (!_deletedProduct)
            throw enums_1.E_ErrorType.E_PRODUCT_NOT_FOUND;
        yield _deletedProduct.remove();
        return { message: "Product is deleted!" };
    }
    catch (e) {
        throw new errorHandler_1.ErrorHandler(e);
    }
});
exports.deleteProductService = deleteProductService;
