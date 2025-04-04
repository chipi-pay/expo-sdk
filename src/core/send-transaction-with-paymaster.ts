import {
  fetchBuildTypedData,
  fetchExecuteTransaction,
  GaslessOptions,
} from "@avnu/gasless-sdk";
import { Account, Call, RpcProvider } from "starknet";
import { decryptPrivateKey } from "./lib/encryption";

export interface ExecuteTransactionParams {
  encryptKey: string;
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
    const { encryptKey, wallet, calls } = params;
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

    const accountAX = new Account(
      provider,
      wallet.publicKey,
      privateKeyDecrypted
    );

    // Build the type data
    // TODO: Call to the API to get the type data
    const typeData = {} /*await fetchBuildTypedData(
      wallet.publicKey,
      calls,
      undefined,
      undefined,
      options
    ); */

    // Sign the message
    const userSignature = await accountAX.signMessage(typeData);

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
