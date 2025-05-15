// Test script for AES-256-CBC certificate encryption with multiple certificates
const crypto = require('crypto');

// Encryption key for certificate data (32 bytes for AES-256)
const AES_ENCRYPTION_KEY = 'CSG@2025_SECURE_CERTIFICATE_KEY_2025';

// Initialization Vector (16 bytes for AES)
const AES_IV = 'CSG_SECURE_IV_25';

/**
 * Encrypts data using AES-256-CBC algorithm
 * @param {any} data - Data to encrypt
 * @returns {string} Encrypted data as base64 string
 */
function encryptWithAES(data) {
  try {
    // Convert data to JSON string if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Create cipher using AES-256-CBC with the key and IV
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      crypto.scryptSync(AES_ENCRYPTION_KEY, 'salt', 32), // Generate 32-byte key
      Buffer.from(AES_IV.padEnd(16, '0').slice(0, 16)) // Ensure IV is exactly 16 bytes
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
function decryptWithAES(encryptedData) {
  try {
    // Create decipher using AES-256-CBC with the key and IV
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      crypto.scryptSync(AES_ENCRYPTION_KEY, 'salt', 32), // Generate 32-byte key
      Buffer.from(AES_IV.padEnd(16, '0').slice(0, 16)) // Ensure IV is exactly 16 bytes
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

// Test multiple certificates
const testCertificates = [
  {
    certificateId: "CSG-12345678",
    userId: "user123",
    email: "john.doe@example.com",
    name: "John Doe",
    issueDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isValid: true
  },
  {
    certificateId: "CSG-87654321",
    userId: "user456",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    issueDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isValid: true
  },
  {
    certificateId: "CSG-ABCD1234",
    userId: "user789",
    email: "robert.johnson@example.com",
    name: "Robert Johnson",
    issueDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isValid: true
  }
];

console.log("=== TESTING MULTIPLE CERTIFICATES ===\n");

// Process each certificate
testCertificates.forEach((cert, index) => {
  console.log(`\n--- CERTIFICATE ${index + 1} ---`);
  console.log("Name:", cert.name);
  console.log("Certificate ID:", cert.certificateId);
  
  // Encrypt the certificate data
  const encryptedData = encryptWithAES(cert);
  console.log("\nEncrypted Data:");
  console.log(encryptedData);
  
  // Decrypt the certificate data
  const decryptedData = decryptWithAES(encryptedData);
  const parsedData = JSON.parse(decryptedData);
  
  // Verify the data matches
  console.log("\nDecryption Verification:");
  console.log("Certificate ID matches:", parsedData.certificateId === cert.certificateId);
  console.log("User ID matches:", parsedData.userId === cert.userId);
  console.log("Email matches:", parsedData.email === cert.email);
  console.log("Name matches:", parsedData.name === cert.name);
});

// Example of how the external API would process the request
console.log("\n\n=== EXTERNAL API SIMULATION ===");

// Create a sample API request with encrypted certificate data
const sampleCertificate = testCertificates[1]; // Using Jane Smith's certificate
const encryptedSampleData = encryptWithAES(sampleCertificate);

const apiRequest = {
  encryptedData: encryptedSampleData
};

console.log("\nAPI Request Payload:");
console.log(JSON.stringify(apiRequest, null, 2));

// Simulate the API receiving and processing the request
console.log("\nAPI Processing:");
try {
  // Step 1: Extract the encrypted data from the request
  const receivedEncryptedData = apiRequest.encryptedData;
  console.log("Received encrypted data ✓");
  
  // Step 2: Decrypt the data using the shared key
  const decryptedApiData = decryptWithAES(receivedEncryptedData);
  console.log("Decryption successful ✓");
  
  // Step 3: Parse the decrypted JSON
  const parsedApiData = JSON.parse(decryptedApiData);
  console.log("JSON parsing successful ✓");
  
  // Step 4: Validate the certificate data
  console.log("\nCertificate Details:");
  console.log("Certificate ID:", parsedApiData.certificateId);
  console.log("User:", parsedApiData.name);
  console.log("Email:", parsedApiData.email);
  console.log("Issue Date:", new Date(parsedApiData.issueDate).toLocaleDateString());
  console.log("Expiry Date:", new Date(parsedApiData.expiryDate).toLocaleDateString());
  
  // Step 5: Generate the certificate (simulated)
  console.log("\nGenerating certificate for", parsedApiData.name, "...");
  console.log("Certificate generated successfully!");
  
  // Step 6: Return the certificate URL (simulated)
  const certificateUrl = `https://www.csgcertificate.com/certificates/${parsedApiData.certificateId}.pdf`;
  console.log("\nCertificate URL:", certificateUrl);
  
} catch (error) {
  console.error("API processing failed:", error);
}

console.log("\n=== ENCRYPTION KEY INFORMATION ===");
console.log("AES Encryption Key:", AES_ENCRYPTION_KEY);
console.log("AES Initialization Vector:", AES_IV);
console.log("Algorithm: AES-256-CBC");
console.log("\nNOTE: This key should be kept secure and only shared with the certificate generation service.");