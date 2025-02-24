import type { DeploymentData, GaslessOptions } from "@avnu/gasless-sdk";
import {
  BASE_URL,
  fetchBuildTypedData,
  fetchExecuteTransaction,
} from "@avnu/gasless-sdk";
import type { Call } from "starknet";
import {
  Account,
  CairoCustomEnum,
  CairoOption,
  CairoOptionVariant,
  CallData,
  ec,
  hash,
  num,
  RpcProvider,
  stark,
} from "starknet";
import { encryptPrivateKey } from "./lib/encryption";
import { WalletData } from "./types";

export interface CreateWalletParams {
  encryptKey: string;
  apiKey: string;
}

export interface CreateWalletResponse {
  success: boolean;
  wallet: WalletData;
  txHash: string;
}

const ARGENT_CLASSHASH =
  "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";

const CONTRACT_ADDRESS =
  "0x05039371eb9f5725bb3012934b8821ff3eb3b48cbdee3a29f798c17e9a641544";
const CONTRACT_ENTRY_POINT_GET_COUNTER = "get_counter";

export const createArgentWallet = async (
  params: CreateWalletParams
): Promise<CreateWalletResponse> => {
  try {
    const { encryptKey, apiKey } = params;

    const rpcUrl = "https://rpc.ankr.com/starknet";
    const options: GaslessOptions = {
      baseUrl: "https://starknet.api.avnu.fi",
      apiKey,
    };
    const provider = new RpcProvider({
      nodeUrl: rpcUrl,
    });

    // Generating the private key with Stark Curve
    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

    // Using Argent X Account v0.4.0 class hash
    // POR REVISAR: CLASSHASH ES EL MISMO EN MAINNET?
    const accountClassHash = ARGENT_CLASSHASH;

    // Calculate future address of the ArgentX account
    const axSigner = new CairoCustomEnum({
      Starknet: { pubkey: starkKeyPubAX },
    });
    // Set the dApp Guardian address
    const axGuardian = new CairoOption<unknown>(CairoOptionVariant.None);

    const AXConstructorCallData = CallData.compile({
      owner: axSigner,
      guardian: axGuardian,
    });

    const contractAddress = hash.calculateContractAddressFromHash(
      starkKeyPubAX,
      accountClassHash,
      AXConstructorCallData,
      0
    );

    // Initiating Account
    const account = new Account(provider, contractAddress, privateKeyAX);
    console.log("Account ", { ...account });

    // Ping to activate the account
    const initialValue: Call[] = [
      {
        contractAddress: CONTRACT_ADDRESS,
        entrypoint: CONTRACT_ENTRY_POINT_GET_COUNTER,
        calldata: [contractAddress],
      },
    ];

    const typeData = await fetchBuildTypedData(
      contractAddress,
      initialValue,
      undefined,
      undefined,
      { baseUrl: BASE_URL, apiKey: options.apiKey },
      accountClassHash
    );

    const userSignature = await account.signMessage(typeData);

    const deploymentData: DeploymentData = {
      class_hash: accountClassHash,
      salt: starkKeyPubAX,
      unique: `${num.toHex(0)}`,
      calldata: AXConstructorCallData.map((value) => num.toHex(value)),
    };

    const executeTransaction = await fetchExecuteTransaction(
      contractAddress,
      JSON.stringify(typeData),
      userSignature,
      options,
      deploymentData
    );

    const encryptedPrivateKey = encryptPrivateKey(privateKeyAX, encryptKey);
    console.log("Encrypted private key: ", encryptedPrivateKey);

    // TODO: Guardar la wallet en dashboard
    console.log(
      "Wallet created successfully with txHash: ",
      executeTransaction.transactionHash
    );
    console.log("Account address: ", contractAddress);
    return {
      success: true,
      wallet: {
        publicKey: contractAddress,
        encryptedPrivateKey,
      },
      txHash: executeTransaction.transactionHash,
    };
  } catch (error: unknown) {
    console.error("Error detallado:", error);

    if (error instanceof Error && error.message.includes("SSL")) {
      throw new Error(
        "Error de conexión SSL. Intenta usando NODE_TLS_REJECT_UNAUTHORIZED=0 o verifica la URL del RPC"
      );
    }

    throw new Error(
      `Error creating Argent wallet: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
