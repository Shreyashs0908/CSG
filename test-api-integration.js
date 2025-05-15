// Test script for API integration with AES-256-CBC encryption
const crypto = require('crypto');
const https = require('https');
const http = require('http');

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

// Simulate the CSG application
function simulateCSGApplication() {
  console.log("=== CSG APPLICATION SIMULATION ===\n");
  
  // User completes the final test
  console.log("User completed final test with passing score.");
  
  // Generate certificate data
  const certificateData = {
    certificateId: "CSG-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    userId: "user" + Math.floor(Math.random() * 1000),
    email: "student" + Math.floor(Math.random() * 100) + "@example.com",
    name: "Student " + Math.floor(Math.random() * 100),
    issueDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isValid: true
  };
  
  console.log("\nGenerated Certificate Data:");
  console.log(certificateData);
  
  // Encrypt the certificate data
  console.log("\nEncrypting certificate data with AES-256-CBC...");
  const encryptedData = encryptWithAES(certificateData);
  
  console.log("\nEncrypted Data:");
  console.log(encryptedData);
  
  // Prepare API request
  const apiRequest = {
    encryptedData: encryptedData
  };
  
  console.log("\nSending encrypted data to certificate generation API...");
  
  // Simulate API call
  simulateCertificateAPI(apiRequest, certificateData);
}

// Simulate the Certificate Generation API
function simulateCertificateAPI(request, originalData) {
  console.log("\n=== CERTIFICATE GENERATION API SIMULATION ===\n");
  
  console.log("Received encrypted request from CSG application.");
  
  try {
    // Extract encrypted data
    const encryptedData = request.encryptedData;
    
    // Decrypt the data
    console.log("\nDecrypting data with AES-256-CBC...");
    const decryptedData = decryptWithAES(encryptedData);
    
    // Parse the decrypted JSON
    const certificateData = JSON.parse(decryptedData);
    
    console.log("\nDecrypted Certificate Data:");
    console.log(certificateData);
    
    // Verify the data integrity
    console.log("\nVerifying data integrity...");
    const isValid = 
      certificateData.certificateId === originalData.certificateId &&
      certificateData.userId === originalData.userId &&
      certificateData.email === originalData.email &&
      certificateData.name === originalData.name;
    
    console.log("Data integrity check:", isValid ? "PASSED ✓" : "FAILED ✗");
    
    if (isValid) {
      // Generate certificate (simulated)
      console.log("\nGenerating certificate for", certificateData.name, "...");
      
      // Simulate certificate generation process
      const certificateUrl = `https://www.csgcertificate.com/certificates/${certificateData.certificateId}.pdf`;
      
      console.log("Certificate generated successfully!");
      console.log("Certificate URL:", certificateUrl);
      
      // Return response to CSG application
      const apiResponse = {
        success: true,
        message: "Certificate generated successfully",
        certificateUrl: certificateUrl,
        certificateId: certificateData.certificateId
      };
      
      console.log("\nSending response back to CSG application:");
      console.log(apiResponse);
      
      // Simulate CSG application receiving the response
      simulateCSGReceivingResponse(apiResponse);
    } else {
      throw new Error("Data integrity check failed");
    }
  } catch (error) {
    console.error("\nAPI Error:", error.message);
    
    // Return error response
    const errorResponse = {
      success: false,
      message: "Failed to generate certificate: " + error.message
    };
    
    console.log("\nSending error response back to CSG application:");
    console.log(errorResponse);
  }
}

// Simulate CSG application receiving the API response
function simulateCSGReceivingResponse(response) {
  console.log("\n=== CSG APPLICATION RECEIVING RESPONSE ===\n");
  
  console.log("Received response from certificate generation API:");
  console.log(response);
  
  if (response.success) {
    console.log("\nCertificate generated successfully!");
    console.log("Certificate URL:", response.certificateUrl);
    console.log("Certificate ID:", response.certificateId);
    
    // Display certificate to user (simulated)
    console.log("\nDisplaying certificate to user...");
    console.log("User can now download or share their certificate.");
  } else {
    console.error("\nFailed to generate certificate:", response.message);
    console.log("Falling back to local certificate generation...");
  }
}

// Run the simulation
console.log("\n=== CERTIFICATE GENERATION PROCESS SIMULATION ===");
console.log("=== Using AES-256-CBC Encryption ===\n");

console.log("Encryption Key:", AES_ENCRYPTION_KEY);
console.log("Initialization Vector:", AES_IV);
console.log("Algorithm: AES-256-CBC\n");

// Start the simulation
simulateCSGApplication();