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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const tsoa_1 = require("tsoa");
const customer_service_1 = require("./customer.service");
const response_1 = __importDefault(require("src/helper/response"));
const errorHandler_1 = require("src/errorHandler");
const enums_1 = require("src/errorHandler/enums");
let CustomerController = class CustomerController extends tsoa_1.Controller {
    getAllCustomer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customer = yield (0, customer_service_1.getAllCustomerService)();
                return response_1.default.success({ data: customer });
            }
            catch (error) {
                new errorHandler_1.ErrorHandler(error);
            }
        });
    }
    findCustomerById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customer = yield (0, customer_service_1.getCustomerByIdService)(id);
                return response_1.default.success({ data: customer });
            }
            catch (error) {
                return response_1.default.error({
                    stat_code: enums_1.HTTP_CODE.INTERNAL_SERVER_ERROR,
                    stat_msg: error.message
                });
            }
        });
    }
    searchCustomer(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customer = yield (0, customer_service_1.searchCustomerService)(query);
                return response_1.default.success({ data: customer });
            }
            catch (error) {
                return response_1.default.error({
                    stat_code: enums_1.HTTP_CODE.INTERNAL_SERVER_ERROR,
                    stat_msg: error.message
                });
            }
        });
    }
    createCustomer(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, customer_service_1.createCustomerService)(payload);
        });
    }
    updateCustomer(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customer = yield (0, customer_service_1.updateCustomerService)(id, payload);
                return response_1.default.success({ data: customer });
            }
            catch (error) {
                return response_1.default.error({
                    stat_code: enums_1.HTTP_CODE.INTERNAL_SERVER_ERROR,
                    stat_msg: error.message
                });
            }
        });
    }
    deleteCustomer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, customer_service_1.deleteCustomerService)(id);
                return response_1.default.success({ data: {} });
            }
            catch (error) {
                return response_1.default.error({
                    stat_code: enums_1.HTTP_CODE.INTERNAL_SERVER_ERROR,
                    stat_msg: error.message
                });
            }
        });
    }
};
__decorate([
    (0, tsoa_1.Get)('/'),
    (0, tsoa_1.Security)('api_key', ['read:customer']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getAllCustomer", null);
__decorate([
    (0, tsoa_1.Get)('/detail/{id}'),
    (0, tsoa_1.Security)('api_key', ['read:customer']),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findCustomerById", null);
__decorate([
    (0, tsoa_1.Get)('/search/'),
    (0, tsoa_1.Security)('api_key', ['read:customer']),
    __param(0, (0, tsoa_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "searchCustomer", null);
__decorate([
    (0, tsoa_1.Post)('/'),
    (0, tsoa_1.Security)('api_key', ['create:customer']),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createCustomer", null);
__decorate([
    (0, tsoa_1.Put)('/{id}/'),
    (0, tsoa_1.Security)('api_key', ["update:customer"]),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateCustomer", null);
__decorate([
    (0, tsoa_1.Delete)('/{id}/'),
    (0, tsoa_1.Security)('api_key', ["delete:customer"]),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "deleteCustomer", null);
CustomerController = __decorate([
    (0, tsoa_1.Tags)('Customer'),
    (0, tsoa_1.Route)('/api/customer')
], CustomerController);
exports.CustomerController = CustomerController;
