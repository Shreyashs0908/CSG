import crypto from 'crypto';

// Encryption key for certificate data (32 bytes for AES-256)
// Note: We're using AES-256 but calling it DES for backward compatibility with the API
export const DES_ENCRYPTION_KEY = 'CSG@2025_SECURE_CERTIFICATE_KEY_2025';

// Initialization Vector (16 bytes for AES)
export const DES_IV = 'CSG_SECURE_IV_25';

/**
 * Encrypts data using AES-256-CBC algorithm
 * @param data - Data to encrypt
 * @returns Encrypted data as base64 string
 */
export function encryptWithDES(data: any): string {
  try {
    // Convert data to JSON string if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Create cipher using AES-256-CBC with the key and IV
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      crypto.scryptSync(DES_ENCRYPTION_KEY, 'salt', 32), // Generate 32-byte key
      Buffer.from(DES_IV.padEnd(16, '0').slice(0, 16)) // Ensure IV is exactly 16 bytes
    );
    
    // Encrypt the data
    let encrypted = cipher.update(dataString, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return encrypted;
  } catch (error) {
    console.error('Error encrypting certificate data:', error);
    throw new Error('Failed to encrypt certificate data');
  }
}

/**
 * Decrypts data that was encrypted using AES-256-CBC algorithm
 * @param encryptedData - Encrypted data as base64 string
 * @returns Decrypted data
 */
export function decryptWithDES(encryptedData: string): string {
  try {
    // Create decipher using AES-256-CBC with the key and IV
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      crypto.scryptSync(DES_ENCRYPTION_KEY, 'salt', 32), // Generate 32-byte key
      Buffer.from(DES_IV.padEnd(16, '0').slice(0, 16)) // Ensure IV is exactly 16 bytes
    );
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting certificate data:', error);
    throw new Error('Failed to decrypt certificate data');
  }
}