// Import Expo Crypto
import * as Crypto from 'expo-crypto';

export const getPrivateKeyAX = () => {
  // Generate 32 random bytes (256 bits)
  const privateKeyBytes = Crypto.getRandomBytes(32);
  
  // Convert to hex string and ensure it's 64 characters (32 bytes)
  const privateKey = Array.from(privateKeyBytes as Uint8Array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  // Add '0x' prefix
  const fullPrivateKey = `0x${privateKey}`;

  // Ensure the private key is within Starknet's valid range (0 to 2^251 - 1)
  // Convert to BigInt and take modulo 2^251
  const maxStarknetValue = BigInt('0x800000000000000000000000000000000000000000000000000000000000000');
  const privateKeyBigInt = BigInt(fullPrivateKey) % maxStarknetValue;
  
  // Convert back to hex string with '0x' prefix
  return `0x${privateKeyBigInt.toString(16)}`;
};