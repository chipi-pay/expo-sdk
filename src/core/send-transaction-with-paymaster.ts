import { Account, Call, RpcProvider } from "starknet";
import { decryptPrivateKey } from "./lib/encryption";
import { BACKEND_URL } from "./backend-url";

export interface ExecuteTransactionParams {
  apiPublicKey: string;
  encryptKey: string;
  bearerToken: string;
  wallet: {
    publicKey: string;
    encryptedPrivateKey: string;
  }; //ClerkWallet;
  calls: Call[];
}

export const executePaymasterTransaction = async (
  params: ExecuteTransactionParams
): Promise<string> => {
  try {
    const { encryptKey, wallet, calls, apiPublicKey, bearerToken } = params;
    console.log("Params: ", params);
    // Fetch the encrypted private key from clerk public metadata
    const privateKeyDecrypted = decryptPrivateKey(
      wallet.encryptedPrivateKey,
      encryptKey
    );

    if (!privateKeyDecrypted) {
      throw new Error("Failed to decrypt private key");
    }

    const provider = new RpcProvider({
      nodeUrl: "https://cloud.argent-api.com/v1/starknet/mainnet/rpc/v0.7",
    });

    const account = new Account(
      provider,
      wallet.publicKey,
      privateKeyDecrypted
    );

    // Build the type data
    // TODO: Call to the API to get the type data
    const typeDataResponse = await fetch(`${BACKEND_URL}/transactions/prepare-typed-data`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'X-API-Key': apiPublicKey,
      },
      body: JSON.stringify({
        publicKey: wallet.publicKey,
        calls: calls,
        accountClassHash: "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f"
      }),
    });

    if (!typeDataResponse.ok) {
      const errorText = await typeDataResponse.text();
      throw new Error(`Error en la API: ${errorText}`);
    }

    const typeData = await typeDataResponse.json();
    // console.log('Type data recibido:', typeData.Calls);

    // Sign the message
    const userSignature = await account.signMessage(typeData);
    //console.log("User signature: ", userSignature);


   
    // Execute the transaction
    const executeTransaction = await fetch(`${BACKEND_URL}/transactions/execute-sponsored-transaction`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'X-API-Key': apiPublicKey,
      },
      body: JSON.stringify({
        publicKey: wallet.publicKey,
        typeData: typeData,
        userSignature: {
          r: (userSignature as any).r.toString(),
          s: (userSignature as any).s.toString(),
          recovery: (userSignature as any).recovery
        }
      }),
    });

    if (!executeTransaction.ok) {
      const errorText = await executeTransaction.text();
      throw new Error(`Error en la API de ejecución: ${errorText}`);
    }

    const result = await executeTransaction.json();
    // console.log('Resultado de la transacción:', result);
    
    if (!result.transactionHash) {
      throw new Error('La respuesta no contiene el hash de la transacción');
    }

    return result.transactionHash;
  } catch (error) {
    console.error("Error sending transaction with paymaster", error);
    throw error;
  }
};
