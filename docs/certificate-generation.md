# Certificate Generation Documentation

## Overview

After a user successfully passes the final test, the CSG application generates a certificate. The certificate data is sent to an external certificate generation API (`www.csgcertificate.com/details`) using encrypted data to ensure security.

## Certificate Data Structure

The certificate includes the following information:

```typescript
interface Certificate {
  certificateId: string    // Unique identifier for the certificate
  userId: string           // User ID of the certificate owner
  email: string            // Email of the certificate owner
  name: string             // Name of the certificate owner
  issueDate: string        // Date when the certificate was issued
  expiryDate: string       // Date when the certificate expires
  isValid: boolean         // Whether the certificate is currently valid
}
```

## Security Implementation

To ensure that certificate requests cannot be intercepted and used to generate unauthorized certificates, all requests to the external certificate API are encrypted using AES-256-CBC encryption.

### Encryption Details

- **Algorithm**: AES-256-CBC
- **Encryption Key**: `CSG@2025_SECURE_CERTIFICATE_KEY_2025`
- **Initialization Vector**: `CSG_SECURE_IV_25`

### Process Flow

1. User completes the final test successfully
2. The application generates certificate data (ID, user info, dates)
3. The certificate data is encrypted using AES-256-CBC
4. The encrypted data is sent to the external API
5. The external API decrypts the data using the same key
6. The certificate is generated and returned to the user
7. The certificate is also stored in the Firestore database

## Integration with External Certificate API

The external certificate generation API expects a POST request with the following structure:

```json
{
  "encryptedData": "base64-encoded-encrypted-certificate-data"
}
```

The API will decrypt the data using the shared encryption key and return a downloadable certificate.

## Security Considerations

- The encryption key should be kept secure and only shared with the certificate generation service
- All certificate data is validated before encryption to ensure integrity
- The application includes a fallback to generate certificates locally if the external API is unavailable
- Certificates are stored in the Firestore database for verification purposes

## Certificate Verification

Certificates can be verified using the `/api/certificate` endpoint with a GET request, providing the certificate ID as a query parameter.