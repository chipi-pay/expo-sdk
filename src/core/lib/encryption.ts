import CryptoES from 'crypto-es';

export const encryptPrivateKey = (
  privateKey: string,
  password: string,
): string => {
  if (!privateKey || !password) {
    throw new Error("Private key and password are required");
  }

  return CryptoES.AES.encrypt(privateKey, password).toString();
};

export const decryptPrivateKey = (
  encryptedPrivateKey: string,
  password: string,
): string | null => {
  if (!encryptedPrivateKey || !password) {
    console.error("Encrypted private key and password are required");
    return null;
  }

  try {
    const bytes = CryptoES.AES.decrypt(encryptedPrivateKey, password);
    const decrypted = bytes.toString(CryptoES.enc.Utf8);

    // Check if the decrypted string is empty
    if (!decrypted) {
      return null;
    }

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
