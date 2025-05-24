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
  return `0x${privateKey}`;
};