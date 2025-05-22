import { createContext, useContext, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChipiSDK } from "../../core/chipi-sdk";

export interface ChipiSDKConfig {
  apiPublicKey: string;
}

interface ChipiContextValue {
  config: ChipiSDKConfig;
  chipiSDK: ChipiSDK;
}

const ChipiContext = createContext<ChipiContextValue | null>(null);
const queryClient = new QueryClient();

export function ChipiProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: ChipiSDKConfig;
}) {
  if (!config.apiPublicKey) {
    throw new Error("Chipi SDK apiPublicKey is required");
  }

  const chipiSDK = useMemo(() => {
    console.log("Creating new ChipiSDK instance with apiPublicKey:", config.apiPublicKey);
    return new ChipiSDK({
      apiPublicKey: config.apiPublicKey,
    });
  }, [config.apiPublicKey]);

  const contextValue = useMemo(() => ({
    config,
    chipiSDK,
  }), [config, chipiSDK]);

  return (
    <QueryClientProvider client={queryClient}>
      <ChipiContext.Provider value={contextValue}>
        {children}
      </ChipiContext.Provider>
    </QueryClientProvider>
  );
}

export function useChipiContext() {
  const context = useContext(ChipiContext);
  if (!context) {
    throw new Error("useChipiContext must be used within a ChipiProvider");
  }
  return context;
}
