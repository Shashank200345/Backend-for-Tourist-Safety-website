# Frontend Implementation Guide - Aadhaar Offline e-KYC Onboarding

This guide explains how to implement the frontend for the Aadhaar Paperless Offline e-KYC onboarding flow.

## Overview

The onboarding flow consists of 2 main steps:
1. **Upload and Verify Aadhaar e-KYC XML** - User uploads the XML file downloaded from UIDAI portal
2. **Complete Onboarding** - User provides additional details and receives Blockchain ID

## API Endpoints

### Base URL
```
http://localhost:3001/api/airport
```

### 1. Upload and Verify Aadhaar e-KYC XML

**Endpoint:** `POST /api/airport/aadhaar/verify`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  ```
  kycFile: <XML File>
  ```

**Response (Success - 200):**
```json
{
  "success": true,
  "verified": true,
  "message": "Aadhaar verified successfully",
  "data": {
    "name": "John Doe",
    "dob": "1990-01-01",
    "gender": "Male",
    "address": "123 Street, City, State",
    "referenceId": "REF123456789",
    "hasPhoto": true
  },
  "nextStep": "Complete onboarding by providing additional details"
}
```

**Response (Error - 400):**
```json
{
  "error": "Aadhaar verification failed",
  "details": "Please ensure you uploaded a valid Aadhaar Paperless Offline e-KYC XML file..."
}
```

### 2. Complete Onboarding

**Endpoint:** `POST /api/airport/onboard`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data` (if uploading file again) OR `application/json`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "country": "India",
  "state": "Delhi",
  "itineraryStartDate": "2024-01-01",
  "itineraryEndDate": "2024-12-31",
  "kycData": {
    "name": "John Doe",
    "dob": "1990-01-01",
    "gender": "Male",
    "address": "123 Street, City, State",
    "referenceId": "REF123456789"
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "touristId": "TID-DEL-ABC123-DEF456",
  "blockchainId": "0x1234567890abcdef1234567890abcdef12345678",
  "transactionHash": "0x...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "touristId": "TID-DEL-ABC123-DEF456",
    "name": "John Doe",
    "email": "user@example.com",
    "blockchainId": "0x1234567890abcdef1234567890abcdef12345678"
  },
  "instructions": {
    "message": "Save your Blockchain ID securely",
    "loginInfo": "You can now login using your Blockchain ID",
    "blockchainId": "0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

### 3. Login with Blockchain ID

**Endpoint:** `POST /api/airport/login`

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```json
{
  "blockchainId": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "touristId": "TID-DEL-ABC123-DEF456",
    "name": "John Doe",
    "email": "user@example.com",
    "blockchainId": "0x1234567890abcdef1234567890abcdef12345678",
    "itineraryEndDate": "2024-12-31T00:00:00.000Z"
  }
}
```

## Frontend Implementation

### Step 1: Create Upload Component

```tsx
// components/AadhaarUpload.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface AadhaarUploadProps {
  onVerificationSuccess: (data: any) => void;
}

const AadhaarUpload: React.FC<AadhaarUploadProps> = ({ onVerificationSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/xml' && 
          selectedFile.type !== 'text/xml' &&
          !selectedFile.name.endsWith('.xml')) {
        setError('Please select a valid XML file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('kycFile', file);

      const response = await axios.post(
        'http://localhost:3001/api/airport/aadhaar/verify',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success && response.data.verified) {
        setVerificationData(response.data.data);
        onVerificationSuccess(response.data.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        err.response?.data?.details || 
        'Failed to verify Aadhaar. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="aadhaar-upload">
      <h2>Step 1: Upload Aadhaar Offline e-KYC</h2>
      
      <div className="instructions">
        <p>
          <strong>How to get your Aadhaar Offline e-KYC file:</strong>
        </p>
        <ol>
          <li>Visit <a href="https://resident.uidai.gov.in/" target="_blank" rel="noopener noreferrer">UIDAI Resident Portal</a> and navigate to "Offline e-KYC" section</li>
          <li>Login with your Aadhaar number</li>
          <li>Download "Aadhaar Paperless Offline e-KYC" XML file</li>
          <li>Upload the downloaded XML file below</li>
        </ol>
      </div>

      <div className="file-upload">
        <input
          type="file"
          accept=".xml,application/xml,text/xml"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <button 
          onClick={handleUpload} 
          disabled={!file || uploading}
        >
          {uploading ? 'Verifying...' : 'Verify Aadhaar'}
        </button>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {verificationData && (
        <div className="verification-success">
          <h3>✓ Aadhaar Verified Successfully</h3>
          <div className="verified-data">
            <p><strong>Name:</strong> {verificationData.name}</p>
            <p><strong>Date of Birth:</strong> {verificationData.dob}</p>
            <p><strong>Gender:</strong> {verificationData.gender}</p>
            <p><strong>Address:</strong> {verificationData.address}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AadhaarUpload;
```

### Step 2: Create Onboarding Form Component

```tsx
// components/OnboardingForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface OnboardingFormProps {
  kycData: any;
  onSuccess: (result: any) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ kycData, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    country: 'India',
    state: '',
    itineraryStartDate: new Date().toISOString().split('T')[0],
    itineraryEndDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/airport/onboard',
        {
          ...formData,
          kycData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Store token and blockchain ID
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('blockchainId', response.data.blockchainId);
        localStorage.setItem('touristId', response.data.touristId);
        
        onSuccess(response.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        'Failed to complete onboarding. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="onboarding-form">
      <h2>Step 2: Complete Your Profile</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Itinerary Start Date</label>
          <input
            type="date"
            value={formData.itineraryStartDate}
            onChange={(e) => setFormData({ ...formData, itineraryStartDate: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Itinerary End Date *</label>
          <input
            type="date"
            value={formData.itineraryEndDate}
            onChange={(e) => setFormData({ ...formData, itineraryEndDate: e.target.value })}
            required
            min={formData.itineraryStartDate}
          />
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Processing...' : 'Complete Onboarding'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingForm;
```

### Step 3: Create Success Component

```tsx
// components/OnboardingSuccess.tsx
import React from 'react';

interface OnboardingSuccessProps {
  result: {
    blockchainId: string;
    touristId: string;
    user: any;
    instructions: any;
  };
}

const OnboardingSuccess: React.FC<OnboardingSuccessProps> = ({ result }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="onboarding-success">
      <div className="success-icon">✓</div>
      <h2>Onboarding Completed Successfully!</h2>
      
      <div className="important-info">
        <h3>Important: Save Your Blockchain ID</h3>
        <p>You will need this Blockchain ID to login to the application.</p>
        
        <div className="blockchain-id-display">
          <code>{result.blockchainId}</code>
          <button onClick={() => copyToClipboard(result.blockchainId)}>
            Copy
          </button>
        </div>
      </div>

      <div className="user-info">
        <h3>Your Details</h3>
        <p><strong>Tourist ID:</strong> {result.touristId}</p>
        <p><strong>Name:</strong> {result.user.name}</p>
        <p><strong>Email:</strong> {result.user.email}</p>
      </div>

      <div className="next-steps">
        <h3>Next Steps</h3>
        <ol>
          <li>Save your Blockchain ID securely</li>
          <li>You can now login using your Blockchain ID</li>
          <li>Your session is valid until: {new Date(result.user.itineraryEndDate).toLocaleDateString()}</li>
        </ol>
      </div>

      <button onClick={() => window.location.href = '/login'}>
        Go to Login
      </button>
    </div>
  );
};

export default OnboardingSuccess;
```

### Step 4: Create Main Onboarding Page

```tsx
// pages/Onboarding.tsx
import React, { useState } from 'react';
import AadhaarUpload from '../components/AadhaarUpload';
import OnboardingForm from '../components/OnboardingForm';
import OnboardingSuccess from '../components/OnboardingSuccess';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'form' | 'success'>('upload');
  const [kycData, setKycData] = useState<any>(null);
  const [onboardingResult, setOnboardingResult] = useState<any>(null);

  const handleVerificationSuccess = (data: any) => {
    setKycData(data);
    setStep('form');
  };

  const handleOnboardingSuccess = (result: any) => {
    setOnboardingResult(result);
    setStep('success');
  };

  return (
    <div className="onboarding-page">
      <div className="container">
        <h1>Airport Onboarding</h1>
        
        {step === 'upload' && (
          <AadhaarUpload onVerificationSuccess={handleVerificationSuccess} />
        )}
        
        {step === 'form' && kycData && (
          <OnboardingForm 
            kycData={kycData} 
            onSuccess={handleOnboardingSuccess}
          />
        )}
        
        {step === 'success' && onboardingResult && (
          <OnboardingSuccess result={onboardingResult} />
        )}
      </div>
    </div>
  );
};

export default Onboarding;
```

### Step 5: Create Login Component

```tsx
// components/Login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [blockchainId, setBlockchainId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/airport/login',
        { blockchainId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('blockchainId', response.data.user.blockchainId);
        localStorage.setItem('touristId', response.data.user.touristId);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        'Login failed. Please check your Blockchain ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <h1>Login with Blockchain ID</h1>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Blockchain ID</label>
            <input
              type="text"
              value={blockchainId}
              onChange={(e) => setBlockchainId(e.target.value)}
              placeholder="0x..."
              required
              pattern="^0x[a-fA-F0-9]{40}$"
            />
            <small>Enter your Blockchain ID (Ethereum address format)</small>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="help-text">
          <p>Don't have a Blockchain ID?</p>
          <a href="/onboarding">Complete Onboarding</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

## API Client Setup

### Axios Configuration

```typescript
// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Styling Recommendations

### CSS Example

```css
/* onboarding.css */
.onboarding-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.aadhaar-upload,
.onboarding-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.instructions {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.file-upload {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.error {
  color: #d32f2f;
  background: #ffebee;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.verification-success {
  background: #e8f5e9;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.blockchain-id-display {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.blockchain-id-display code {
  flex: 1;
  font-family: monospace;
  word-break: break-all;
}
```

## Important Notes

1. **File Upload**: The XML file must be uploaded as `multipart/form-data` with field name `kycFile`

2. **Blockchain ID Storage**: Always store the Blockchain ID securely. Users will need it to login.

3. **Token Management**: Store the JWT token in localStorage or httpOnly cookies for authenticated requests.

4. **Error Handling**: Always handle errors gracefully and show user-friendly messages.

5. **Validation**: Validate Blockchain ID format (0x followed by 40 hex characters) on the frontend.

6. **CORS**: Ensure your backend CORS settings allow requests from your frontend domain.

## Testing

### Test Flow

1. Download a sample Aadhaar Offline e-KYC XML from UIDAI portal
2. Upload it through the frontend
3. Complete the onboarding form
4. Save the Blockchain ID
5. Test login with the Blockchain ID

### Sample Test Data

For development/testing, you can use mock data if the backend is in development mode.

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Token Storage**: Consider using httpOnly cookies instead of localStorage
3. **Input Validation**: Validate all inputs on both frontend and backend
4. **Error Messages**: Don't expose sensitive information in error messages
5. **File Size**: Limit file upload size (backend has 5MB limit)

