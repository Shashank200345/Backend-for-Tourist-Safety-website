# Frontend Quick Start Guide

## 🚀 Quick Integration Steps

### 1. Install Dependencies (if using React)

```bash
npm install axios
# or
yarn add axios
```

### 2. API Base URL

```typescript
const API_BASE_URL = 'http://localhost:3001/api/airport';
```

### 3. Three Main API Calls

#### A. Upload Aadhaar e-KYC XML

```typescript
const formData = new FormData();
formData.append('kycFile', xmlFile); // File from input

const response = await fetch(`${API_BASE_URL}/aadhaar/verify`, {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// data.data contains: { name, dob, gender, address, referenceId }
```

#### B. Complete Onboarding

```typescript
const response = await fetch(`${API_BASE_URL}/onboard`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    country: 'India',
    state: 'Delhi',
    itineraryStartDate: '2024-01-01',
    itineraryEndDate: '2024-12-31',
    kycData: {
      // Data from step A
      name: data.data.name,
      dob: data.data.dob,
      gender: data.data.gender,
      address: data.data.address,
      referenceId: data.data.referenceId,
    },
  }),
});

const result = await response.json();
// Save: result.blockchainId, result.token, result.touristId
```

#### C. Login with Blockchain ID

```typescript
const response = await fetch(`${API_BASE_URL}/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    blockchainId: '0x1234...', // User's saved Blockchain ID
  }),
});

const result = await response.json();
// Save: result.token for authenticated requests
```

### 4. Authenticated Requests

```typescript
const token = localStorage.getItem('authToken');

const response = await fetch(`${API_BASE_URL}/profile`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## 📋 Complete Flow Example

```typescript
// Step 1: Upload XML
async function uploadAadhaarKyc(file: File) {
  const formData = new FormData();
  formData.append('kycFile', file);
  
  const res = await fetch('http://localhost:3001/api/airport/aadhaar/verify', {
    method: 'POST',
    body: formData,
  });
  
  return await res.json();
}

// Step 2: Complete Onboarding
async function completeOnboarding(kycData: any, userDetails: any) {
  const res = await fetch('http://localhost:3001/api/airport/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...userDetails,
      kycData,
    }),
  });
  
  const result = await res.json();
  
  // IMPORTANT: Save these values
  localStorage.setItem('blockchainId', result.blockchainId);
  localStorage.setItem('token', result.token);
  localStorage.setItem('touristId', result.touristId);
  
  return result;
}

// Step 3: Login
async function login(blockchainId: string) {
  const res = await fetch('http://localhost:3001/api/airport/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockchainId }),
  });
  
  const result = await res.json();
  localStorage.setItem('token', result.token);
  return result;
}
```

## 🎨 UI Components Needed

1. **File Upload Component**
   - Input type="file" with accept=".xml"
   - Show upload progress
   - Display verification result

2. **Onboarding Form**
   - Email input
   - Country/State inputs
   - Date pickers for itinerary
   - Submit button

3. **Success Screen**
   - Display Blockchain ID (make it copyable)
   - Show user details
   - Link to login page

4. **Login Form**
   - Blockchain ID input
   - Validation (must start with 0x and be 42 chars)
   - Error handling

## ⚠️ Important Points

1. **Blockchain ID Format**: Must be `0x` followed by 40 hex characters (42 total)
2. **File Type**: Only XML files accepted
3. **File Size**: Max 5MB
4. **Token Storage**: Store JWT token for authenticated requests
5. **Error Handling**: Always show user-friendly error messages

## 🔗 Where to Get Aadhaar e-KYC XML

Users need to:
1. Visit: https://resident.uidai.gov.in/ (Main portal) and navigate to "Offline e-KYC" section
   - OR directly try: https://resident.uidai.gov.in/offlineaadhaar
2. Login with Aadhaar
3. Download "Aadhaar Paperless Offline e-KYC" XML file
4. Upload it in your app

## 📱 Example React Component

```tsx
function OnboardingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [kycData, setKycData] = useState(null);
  const [step, setStep] = useState(1);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('kycFile', file!);
    
    const res = await fetch('/api/airport/aadhaar/verify', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    if (data.success) {
      setKycData(data.data);
      setStep(2);
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <input 
            type="file" 
            accept=".xml"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button onClick={handleUpload}>Verify</button>
        </div>
      )}
      
      {step === 2 && <OnboardingForm kycData={kycData} />}
    </div>
  );
}
```

## 🐛 Common Issues

1. **CORS Error**: Make sure backend CORS allows your frontend URL
2. **File Upload Fails**: Check file is XML and < 5MB
3. **Login Fails**: Verify Blockchain ID format (0x + 40 hex chars)
4. **Token Expired**: Check itinerary end date hasn't passed

