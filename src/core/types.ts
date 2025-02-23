
export interface ChipiSDKConfig {
    paymasterApiKey: string;
    rpcUrl: string;
    argentClassHash: string;
    contractAddress: string;
    contractEntryPoint?: string;
  }
  
  export interface WalletData {
    publicKey: string;
    encryptedPrivateKey: string;
  }
  
  export interface TransactionResult {
    success: boolean;
    txHash: string;
  } 