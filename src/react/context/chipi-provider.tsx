import { createContext, useContext } from 'react';
import type { ChipiSDKConfig } from '../../core/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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