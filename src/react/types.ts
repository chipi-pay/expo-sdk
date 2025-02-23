import type { ChipiSDKConfig, WalletData } from '../core/types';

export interface ChipiProviderProps {
  children: React.ReactNode;
  config: ChipiSDKConfig;
}

export interface StorageAdapter {
  saveWallet: (wallet: WalletData) => Promise<void>;
  getWallet?: (address: string) => Promise<WalletData | null>;
}