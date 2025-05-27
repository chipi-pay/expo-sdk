import type { DeploymentData } from "@avnu/gasless-sdk";
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
import { CreateWalletParams, CreateWalletResponse, WalletData } from "./types";
import { BACKEND_URL } from "./backend-url";
import { getPrivateKeyAX } from "./get-private-key-ax";


export const createArgentWallet = async (
   params: CreateWalletParams
): Promise<CreateWalletResponse> => {
  try {
    const { encryptKey, apiPublicKey, bearerToken, nodeUrl } = params;
   
    const provider = new RpcProvider({ nodeUrl: nodeUrl });
    // Generating the private key with Stark Curve
    const privateKeyAX = getPrivateKeyAX();
    // const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

    // Using Argent X Account v0.4.0 class hash
    const accountClassHash = "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f" //params.argentClassHash;
  
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

    const publicKey = hash.calculateContractAddressFromHash(
      starkKeyPubAX,
      accountClassHash,
      AXConstructorCallData,
      0
    );
    // Initiating Account
    const account = new Account(provider, publicKey, privateKeyAX);
    // Backend Call API to create the wallet
    const typeDataResponse = await fetch(`${BACKEND_URL}/chipi-wallets/prepare-creation`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'x-api-key': apiPublicKey,
      },
      body: JSON.stringify({
        publicKey,
      }),
    });
    const { typeData, accountClassHash: accountClassHashResponse } = await typeDataResponse.json();
    // Sign the message
    const userSignature = await account.signMessage(typeData);


    const deploymentData: DeploymentData = {
      class_hash: accountClassHashResponse,
      salt: starkKeyPubAX,
      unique: `${num.toHex(0)}`,
      calldata: AXConstructorCallData.map((value) => num.toHex(value)),
    };
    const encryptedPrivateKey = encryptPrivateKey(privateKeyAX, encryptKey);

    // Llamar a la API para guardar la wallet en dashboard
    const executeTransactionResponse = await fetch(`${BACKEND_URL}/chipi-wallets`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'x-api-key': apiPublicKey,
      },
      body: JSON.stringify({
        apiPublicKey,
        publicKey,
        userSignature: {
          r: (userSignature as any).r.toString(),
          s: (userSignature as any).s.toString(),
          recovery: (userSignature as any).recovery
        },
        typeData,
        encryptedPrivateKey,
        deploymentData: {
          ...deploymentData,
          salt: `${deploymentData.salt}`,
          calldata: deploymentData.calldata.map(data => `${data}`),
        }
      }),
    });
    const executeTransaction = await executeTransactionResponse.json();

    if (executeTransaction.success) {
    return {
      success: true,
      txHash: executeTransaction.txHash,
      wallet: {
        publicKey: executeTransaction.walletPublicKey,
        encryptedPrivateKey: encryptedPrivateKey,
      } as WalletData,
      };
    } else {
      return {
        success: false,
        txHash: "",
        wallet: {
          publicKey: "",
          encryptedPrivateKey: "",
        } as WalletData,
      };
    }
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

