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

export interface CreateWalletParams {
  pin: string;
  rpcUrl: string;
  options: GaslessOptions;
  argentClassHash: string;
  contractAddress: string;
  contractEntryPoint: string;
}

export const createArgentWallet = async (params: CreateWalletParams) => {
    const provider = new RpcProvider({
      nodeUrl: params.rpcUrl,
    });
  
    // Generating the private key with Stark Curve
    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
  
    // Using Argent X Account v0.4.0 class hash
    // POR REVISAR: CLASSHASH ES EL MISMO EN MAINNET?
    const accountClassHash = params.argentClassHash as string || "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f" as string;
  
    // Calculate future address of the ArgentX account
    const axSigner = new CairoCustomEnum({ Starknet: { pubkey: starkKeyPubAX } });
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
      0,
    );
  
    // Initiating Account
    const account = new Account(provider, contractAddress, privateKeyAX);
    console.log(account);

    const initialValue: Call[] = [
        {
          contractAddress: params.contractAddress || "0x05039371eb9f5725bb3012934b8821ff3eb3b48cbdee3a29f798c17e9a641544",
          entrypoint: params.contractEntryPoint || "get_counter",
          calldata: [contractAddress],
        },
      ];
    
      try {
        const typeData = await fetchBuildTypedData(
          contractAddress,
          initialValue,
          undefined,
          undefined,
          params.options,
          accountClassHash,
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
          params.options,
          deploymentData,
        );

        const encryptedPrivateKey = encryptPrivateKey(privateKeyAX, params.pin);
        console.log(encryptedPrivateKey);
    
        // Now lets save the wallet in clerk public metadata
        /* await saveWallet({
          contractAddress: contractAddress as `0x${string}`,
          encryptedPrivateKey: encryptPrivateKey(privateKeyAX, params.pin),
        });
        console.log(
          `Wallet created successfully with txHash: ${executeTransaction.transactionHash}`,
        ); */
    
        // TODO: Guardar la wallet en dashboard

        return { success: true, txHash: executeTransaction.transactionHash };
      } catch (error: unknown) {
        console.error("Error creating Argent wallet", error);
        throw new Error("Error creating Argent wallet");
      }
  }