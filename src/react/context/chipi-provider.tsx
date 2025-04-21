import { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChipiSDK } from '../../core/chipi-sdk';

export interface ChipiSDKConfig {
  apiKey: string;
  secretKey: string;
  appId: string;
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
  if (!config.apiKey || !config.secretKey || !config.appId) {
    throw new Error('Chipi SDK apiKey, secretKey and appId are required');
  }

  const chipiSDK = new ChipiSDK({
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    appId: config.appId,
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