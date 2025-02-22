"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChipiSDK = void 0;
const create_wallet_1 = require("./src/create-wallet");
const send_transaction_with_paymaster_1 = require("./src/send-transaction-with-paymaster");
class ChipiSDK {
    constructor(config) {
        this.options = {
            baseUrl: "https://paymaster.avnu.fi",
            apiKey: config.paymasterApiKey,
        };
        this.rpcUrl = config.rpcUrl;
        this.argentClassHash = config.argentClassHash;
        this.contractAddress = config.contractAddress;
        this.contractEntryPoint = config.contractEntryPoint || "get_counter";
    }
    async createWallet(pin) {
        return (0, create_wallet_1.createArgentWallet)({
            pin,
            rpcUrl: this.rpcUrl,
            options: this.options,
            argentClassHash: this.argentClassHash,
            contractAddress: this.contractAddress,
            contractEntryPoint: this.contractEntryPoint,
        });
    }
    async executeTransaction(input) {
        return (0, send_transaction_with_paymaster_1.executePaymasterTransaction)({
            ...input,
            rpcUrl: this.rpcUrl,
            options: this.options,
        });
    }
}
exports.ChipiSDK = ChipiSDK;
