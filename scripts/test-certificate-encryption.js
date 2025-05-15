// Test script for certificate encryption
const crypto = require('crypto');

// Encryption key for certificate data (32 bytes for AES-256)
// Note: We're using AES-256 but calling it DES for backward compatibility with the API
const DES_ENCRYPTION_KEY = 'CSG@2025_SECURE_CERTIFICATE_KEY_2025';

// Initialization Vector (16 bytes for AES)
const DES_IV = 'CSG_SECURE_IV_25';

/**
 * Encrypts data using AES-256-CBC algorithm
 * @param {any} data - Data to encrypt
 * @returns {string} Encrypted data as base64 string
 */
function encryptWithDES(data) {
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
 * @param {string} encryptedData - Encrypted data as base64 string
 * @returns {string} Decrypted data
 */
function decryptWithDES(encryptedData) {
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

// Test certificate data
const testCertificate = {
  certificateId: "CSG-12345678",
  userId: "user123",
  email: "test@example.com",
  name: "Test User",
  issueDate: new Date().toISOString(),
  expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
  isValid: true
};

console.log("=== CERTIFICATE ENCRYPTION TEST ===");
console.log("\nOriginal Certificate Data:");
console.log(testCertificate);

// Encrypt the certificate data
const encryptedData = encryptWithDES(testCertificate);
console.log("\nEncrypted Certificate Data (DES):");
console.log(encryptedData);

// Decrypt the certificate data
const decryptedData = decryptWithDES(encryptedData);
console.log("\nDecrypted Certificate Data:");
console.log(decryptedData);

// Parse the decrypted JSON
const parsedData = JSON.parse(decryptedData);
console.log("\nParsed Certificate Data:");
console.log(parsedData);

// Verify the decryption worked correctly
console.log("\nVerification:");
console.log("Certificate ID matches:", parsedData.certificateId === testCertificate.certificateId);
console.log("User ID matches:", parsedData.userId === testCertificate.userId);
console.log("Email matches:", parsedData.email === testCertificate.email);
console.log("Name matches:", parsedData.name === testCertificate.name);

console.log("\n=== ENCRYPTION DETAILS ===");
console.log("DES Encryption Key:", DES_ENCRYPTION_KEY);
console.log("DES Initialization Vector:", DES_IV);
console.log("\nNOTE: This key should be kept secure and only shared with the certificate generation service.");