import { RpcProvider, stark, ec, CairoCustomEnum, CairoOption, CairoOptionVariant, CallData, hash, Account, num } from 'starknet';
import CryptoJS from 'crypto-js';

// src/core/create-wallet.ts
var encryptPrivateKey = (privateKey, password) => {
  if (!privateKey || !password) {
    throw new Error("Private key and password are required");
  }
  return CryptoJS.AES.encrypt(privateKey, password).toString();
};

// src/core/create-wallet.ts
var createArgentWallet = async (params) => {
  try {
    const { encryptKey, apiKey, secretKey, appId, nodeUrl } = params;
    const provider = new RpcProvider({ nodeUrl });
    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
    const accountClassHash = "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
    const axSigner = new CairoCustomEnum({
      Starknet: { pubkey: starkKeyPubAX }
    });
    const axGuardian = new CairoOption(CairoOptionVariant.None);
    const AXConstructorCallData = CallData.compile({
      owner: axSigner,
      guardian: axGuardian
    });
    const contractAddress = hash.calculateContractAddressFromHash(
      starkKeyPubAX,
      accountClassHash,
      AXConstructorCallData,
      0
    );
    const account = new Account(provider, contractAddress, privateKeyAX);
    const typeDataResponse = await fetch("https://chipi-back-production.up.railway.app/chipi-wallets/prepare-creation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`,
        "X-API-Key": apiKey
      },
      body: JSON.stringify({
        publicKey: contractAddress,
        appId
      })
    });
    const { typeData, accountClassHash: accountClassHashResponse } = await typeDataResponse.json();
    const userSignature = await account.signMessage(typeData);
    const deploymentData = {
      class_hash: accountClassHashResponse,
      salt: starkKeyPubAX,
      unique: `${num.toHex(0)}`,
      calldata: AXConstructorCallData.map((value) => num.toHex(value))
    };
    const encryptedPrivateKey = encryptPrivateKey(privateKeyAX, encryptKey);
    const executeTransactionResponse = await fetch("https://chipi-back-production.up.railway.app/chipi-wallets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`,
        "X-API-Key": apiKey
      },
      body: JSON.stringify({
        publicKey: `${contractAddress}`,
        userSignature: {
          r: userSignature.r.toString(),
          s: userSignature.s.toString(),
          recovery: userSignature.recovery
        },
        typeData,
        appId,
        encryptedPrivateKey,
        deploymentData: {
          ...deploymentData,
          salt: `${deploymentData.salt}`,
          calldata: deploymentData.calldata.map((data) => `${data}`)
        }
      })
    });
    const executeTransaction = await executeTransactionResponse.json();
    return {
      success: true,
      txHash: executeTransaction.txHash,
      wallet: {
        publicKey: executeTransaction.publicKey,
        encryptedPrivateKey
      }
    };
  } catch (error) {
    console.error("Error detallado:", error);
    if (error instanceof Error && error.message.includes("SSL")) {
      throw new Error(
        "Error de conexi\xF3n SSL. Intenta usando NODE_TLS_REJECT_UNAUTHORIZED=0 o verifica la URL del RPC"
      );
    }
    throw new Error(
      `Error creating Argent wallet: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
createArgentWallet(
  {
    appId: "org_2w1eJnTbFHqDqd0deVJgxLzBe4y",
    encryptKey: "2233",
    apiKey: "pk_dev_002136da33b04d293564fd5e5033af65",
    secretKey: "sk_dev_d6773b54523dacb9823eca59dce9562a81135be86a645602eda0975cbba5d4e3",
    nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_7"
  }
);

export { createArgentWallet };
//# sourceMappingURL=create-wallet.mjs.map
//# sourceMappingURL=create-wallet.mjs.map