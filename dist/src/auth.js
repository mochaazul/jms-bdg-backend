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
exports.expressAuthentication = void 0;
const jwt_1 = require("./helper/jwt");
const user_1 = require("@entity/user");
const enums_1 = require("./errorHandler/enums");
function expressAuthentication(request, securityName, scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (securityName === "api_key") {
                const headerToken = request.headers['authorization'];
                let token = "";
                if (request.headers && headerToken) {
                    token = String(headerToken);
                }
                if (!token)
                    throw "No token provided";
                const decoded = yield (0, jwt_1.verifyToken)(token);
                if (decoded instanceof Error)
                    throw decoded.message;
                const user = yield user_1.User.findOne({
                    where: { id: decoded.id },
                    relations: ['role', 'role.scopes']
                });
                if (!user) {
                    throw enums_1.E_ErrorType.E_USER_NOT_FOUND;
                }
                const userScopes = user.role.scopes;
                const userScopeKeys = Object.keys(userScopes)
                    .filter(key => !['id', 'created_at', 'updated_at'].includes(key) && userScopes[key] === true)
                    .map(scope => (scope.replace(/_/g, ":")));
                const isScopeValid = scopes === null || scopes === void 0 ? void 0 : scopes.every(scope => userScopeKeys.includes(scope));
                if (!isScopeValid)
                    throw enums_1.E_ErrorType.E_USER_IS_NOT_AUTHORIZED;
                return new Promise((resolve, reject) => {
                    resolve(decoded);
                });
            }
        }
        catch (error) {
            return new Promise((resolve, reject) => {
                reject(new Error(error));
            });
        }
    });
}
exports.expressAuthentication = expressAuthentication;
