import {
  fetchBuildTypedData,
  fetchExecuteTransaction,
  GaslessOptions,
} from "@avnu/gasless-sdk";
import { Account, Call, RpcProvider } from "starknet";
import { decryptPrivateKey } from "./lib/encryption";

export interface ExecuteTransactionParams {
  encryptKey: string;
  secretKey: string;
  apiKey: string;
  wallet: {
    publicKey: string;
    encryptedPrivateKey: string;
  }; //ClerkWallet;
  contractAddress: string;
  calls: Call[];
}

export const executePaymasterTransaction = async (
  params: ExecuteTransactionParams
): Promise<string> => {
  try {
    const { encryptKey, wallet, calls, secretKey, apiKey } = params;
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
    const typeDataResponse = await fetch("https://chipi-back-production.up.railway.app/transactions", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        wallet: wallet.publicKey,
        calls: calls,
      }),
    });
    const { typeData, accountClassHash: accountClassHashResponse } = await typeDataResponse.json(); 
    

    // console.log("Type data: ", typeData);
    // Sign the message
    const userSignature = await account.signMessage(typeData);
    console.log("User signature: ", userSignature);
    /*await fetchBuildTypedData(
      wallet.publicKey,
      calls,
      undefined,
      undefined,
      options
    ); */

   
    // Execute the transaction
    // TODO: Call to the API to execute the transaction
    /* const executeTransaction = await fetchExecuteTransaction(
      wallet.publicKey,
      JSON.stringify(typeData),
      userSignature,
      options
    ); */

    return "0x1234567890abcdef"; //executeTransaction.transactionHash;
  } catch (error) {
    console.error("Error sending transaction with paymaster", error);
    throw error;
  }
};
