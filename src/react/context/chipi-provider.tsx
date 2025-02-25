import { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChipiSDK } from '../../core/chipi-sdk';

export interface ChipiSDKConfig {
  apiKey: string;
  rpcUrl: string;
  network: "mainnet" | "sepolia";
  activateContractAddress?: string;
  argentClassHash?: string;
  activateContractEntryPoint?: string;
  // Add other config options here as needed
}

interface ChipiContextValue {
  config: ChipiSDKConfig;
  chipiSDK: ChipiSDK;
}

const ChipiContext = createContext<ChipiContextValue | null>(null);
const queryClient = new QueryClient();

export function ChipiProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode;
  config: ChipiSDKConfig;
}) {
  if (!config.apiKey) {
    throw new Error('Chipi SDK requires an API key');
  }

  const chipiSDK = new ChipiSDK({
    apiKey: config.apiKey,
    rpcUrl: config.rpcUrl,
    network: config.network,
    argentClassHash: config.argentClassHash,
    activateContractAddress: config.activateContractAddress,
    activateContractEntryPoint: config.activateContractEntryPoint,
  });

  return (
    <ChipiContext.Provider value={{ config, chipiSDK }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ChipiContext.Provider>
  );
}

export function useChipiContext() {
  const context = useContext(ChipiContext);
  if (!context) {
    throw new Error('useChipiContext must be used within a ChipiProvider');
  }
  return context;
}