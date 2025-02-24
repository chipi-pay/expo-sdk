import { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface ChipiSDKConfig {
  apiKey: string;
  // Add other config options here as needed
}

interface ChipiContextValue {
  config: ChipiSDKConfig;
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

  return (
    <ChipiContext.Provider value={{ config }}>
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