// API Configuration
const API_BASE_URL = 'http://localhost:3001/api/airport';

// Store onboarding result
let onboardingResult = null;
let capturedImageBlob = null;
let stream = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkApiStatus();
    setDefaultDates();
});

// Set default dates
function setDefaultDates() {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30); // 30 days from now

    document.getElementById('itineraryStartDate').value = today.toISOString().split('T')[0];
    document.getElementById('itineraryEndDate').value = endDate.toISOString().split('T')[0];
    
    // Set max date for end date
    document.getElementById('itineraryEndDate').min = today.toISOString().split('T')[0];
}

// Update end date min when start date changes
document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('itineraryStartDate');
    const endDateInput = document.getElementById('itineraryEndDate');
    
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', (e) => {
            endDateInput.min = e.target.value;
        });
    }
});

// Check API status
async function checkApiStatus() {
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        
        if (response.ok) {
            updateApiStatus('connected', '✅ API Connected');
        } else {
            updateApiStatus('error', '❌ API Error');
        }
    } catch (error) {
        updateApiStatus('error', '❌ API Not Available - Make sure backend is running on port 3001');
    }
}

function updateApiStatus(status, text) {
    const statusEl = document.getElementById('apiStatus');
    const textEl = document.getElementById('apiStatusText');
    
    statusEl.className = `status-indicator ${status}`;
    textEl.textContent = text;
}

// Camera functions
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user', // Front camera
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        });
        
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.style.display = 'block';
        
        document.getElementById('startCameraBtn').style.display = 'none';
        document.getElementById('captureBtn').style.display = 'inline-block';
        document.getElementById('imagePreview').style.display = 'none';
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please use "Upload Photo" instead.');
    }
}

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // Stop camera stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Convert to blob
    canvas.toBlob((blob) => {
        capturedImageBlob = blob;
        displayImagePreview(blob);
        
        video.style.display = 'none';
        document.getElementById('captureBtn').style.display = 'none';
        document.getElementById('retakeBtn').style.display = 'inline-block';
    }, 'image/jpeg', 0.9);
}

function retakePhoto() {
    capturedImageBlob = null;
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('startCameraBtn').style.display = 'inline-block';
    startCamera();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        capturedImageBlob = file;
        displayImagePreview(file);
        
        // Stop camera if running
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            document.getElementById('video').style.display = 'none';
            document.getElementById('captureBtn').style.display = 'none';
        }
        document.getElementById('retakeBtn').style.display = 'inline-block';
    }
}

function displayImagePreview(fileOrBlob) {
    const preview = document.getElementById('imagePreview');
    const reader = new FileReader();
    
    reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`;
        preview.style.display = 'block';
    };
    
    reader.readAsDataURL(fileOrBlob);
}

// Complete Onboarding
async function completeOnboarding(event) {
    event.preventDefault();
    
    const statusEl = document.getElementById('onboardingStatus');
    const submitBtn = document.getElementById('submitBtn');

    // Check if image is captured
    if (!capturedImageBlob) {
        showStatus(statusEl, 'error', 'Please capture or upload your photo');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    showStatus(statusEl, 'loading', 'Registering and generating Blockchain ID...');

    try {
        // Get form values for validation
        const aadhaarNumber = document.getElementById('aadhaarNumber').value.trim();
        
        // Validate Aadhaar number before creating FormData
        if (!/^\d{12}$/.test(aadhaarNumber)) {
            showStatus(statusEl, 'error', 'Invalid Aadhaar number. Must be exactly 12 digits.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Registration';
            return;
        }

        // Create FormData for multipart/form-data
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('aadhaarNumber', aadhaarNumber);
        formData.append('dob', document.getElementById('dob').value);
        formData.append('gender', document.getElementById('gender').value);
        formData.append('address', document.getElementById('address').value.trim());
        formData.append('country', document.getElementById('country').value.trim());
        formData.append('state', document.getElementById('state').value.trim());
        formData.append('itineraryStartDate', document.getElementById('itineraryStartDate').value);
        formData.append('itineraryEndDate', document.getElementById('itineraryEndDate').value);
        formData.append('photo', capturedImageBlob, 'photo.jpg');

        const response = await fetch(`${API_BASE_URL}/onboard`, {
            method: 'POST',
            body: formData, // FormData automatically sets Content-Type with boundary
        });

        const data = await response.json();

        if (response.ok && data.success) {
            onboardingResult = data;
            
            // Store in localStorage
            localStorage.setItem('blockchainId', data.blockchainId);
            localStorage.setItem('token', data.token);
            localStorage.setItem('touristId', data.touristId);
            
            showStatus(statusEl, 'success', '✅ Registration completed successfully!');
            
            // Show success screen
            document.getElementById('onboardingForm').style.display = 'none';
            document.getElementById('successScreen').style.display = 'block';
            
            // Display results
            document.getElementById('blockchainIdDisplay').textContent = data.blockchainId;
            
            const userDetailsEl = document.getElementById('userDetails');
            let imageHtml = '';
            if (data.user.imageUrl) {
                imageHtml = `<p><strong>Photo:</strong> <img src="${data.user.imageUrl}" alt="User Photo" style="max-width: 200px; border-radius: 8px; margin-top: 10px;"></p>`;
            }
            userDetailsEl.innerHTML = `
                <p><strong>Tourist ID:</strong> ${data.touristId}</p>
                <p><strong>Name:</strong> ${data.user.name}</p>
                <p><strong>Email:</strong> ${data.user.email}</p>
                <p><strong>Blockchain ID:</strong> ${data.blockchainId}</p>
                <p><strong>Transaction Hash:</strong> ${data.transactionHash || 'N/A'}</p>
                ${imageHtml}
            `;

            // Display QR code if available
            if (data.qrCode && data.qrCode.qrCodeImage) {
                const qrCodeBox = document.getElementById('qrCodeBox');
                const qrCodeDisplay = document.getElementById('qrCodeDisplay');
                const qrExpiry = document.getElementById('qrExpiry');
                
                qrCodeDisplay.innerHTML = `<img src="${data.qrCode.qrCodeImage}" alt="QR Code" style="max-width: 300px; border: 4px solid #667eea; border-radius: 8px; padding: 10px; background: white;">`;
                
                const expiryDate = new Date(data.qrCode.expiresAt);
                qrExpiry.textContent = `Expires: ${expiryDate.toLocaleString()}`;
                
                qrCodeBox.style.display = 'block';
                
                // Store QR code data (now contains blockchain ID)
                window.currentQRCode = {
                    blockchainId: data.blockchainId, // Store blockchain ID
                    qrCodeData: data.qrCode.qrCodeUrl, // This now contains blockchain ID
                    expiresAt: data.qrCode.expiresAt,
                };
            }
        } else {
            showStatus(statusEl, 'error', data.error || 'Registration failed');
        }
    } catch (error) {
        showStatus(statusEl, 'error', `Error: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Registration';
    }
}

// Copy Blockchain ID
function copyBlockchainId() {
    const blockchainId = document.getElementById('blockchainIdDisplay').textContent;
    navigator.clipboard.writeText(blockchainId).then(() => {
        alert('Blockchain ID copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = blockchainId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Blockchain ID copied to clipboard!');
    });
}

// Copy Blockchain ID from QR Code
function copyQRUrl() {
    if (window.currentQRCode && window.currentQRCode.blockchainId) {
        navigator.clipboard.writeText(window.currentQRCode.blockchainId).then(() => {
            alert('Blockchain ID copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy Blockchain ID');
        });
    }
}

// Generate New QR Code
async function generateNewQR() {
    const blockchainId = localStorage.getItem('blockchainId');
    if (!blockchainId) {
        alert('Blockchain ID not found. Please complete registration first.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/generate-qr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blockchainId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Update QR code display
            const qrCodeDisplay = document.getElementById('qrCodeDisplay');
            const qrExpiry = document.getElementById('qrExpiry');
            
            qrCodeDisplay.innerHTML = `<img src="${data.qrCode.qrCodeImage}" alt="QR Code" style="max-width: 300px; border: 4px solid #667eea; border-radius: 8px; padding: 10px; background: white;">`;
            
            const expiryDate = new Date(data.qrCode.expiresAt);
            qrExpiry.textContent = `Expires: ${expiryDate.toLocaleString()}`;
            
            window.currentQRCode = {
                qrCodeUrl: data.qrCode.qrCodeUrl,
                expiresAt: data.qrCode.expiresAt,
            };
            
            alert('New QR code generated successfully!');
        } else {
            alert(data.error || 'Failed to generate QR code');
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        alert('Failed to generate QR code. Please try again.');
    }
}

// Go to Login
function goToLogin() {
    document.getElementById('successScreen').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    
    // Pre-fill blockchain ID if available
    const savedBlockchainId = localStorage.getItem('blockchainId');
    if (savedBlockchainId) {
        document.getElementById('loginBlockchainId').value = savedBlockchainId;
    }
}

// Login with Blockchain ID
async function loginWithBlockchainId(event) {
    event.preventDefault();
    
    const statusEl = document.getElementById('loginStatus');
    const resultEl = document.getElementById('loginResult');
    const loginBtn = document.getElementById('loginBtn');
    const blockchainId = document.getElementById('loginBlockchainId').value.trim();

    // Validate format
    if (!/^0x[a-fA-F0-9]{40}$/.test(blockchainId)) {
        showStatus(statusEl, 'error', 'Invalid Blockchain ID format. Must be 0x followed by 40 hex characters.');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    showStatus(statusEl, 'loading', 'Logging in...');

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blockchainId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showStatus(statusEl, 'success', '✅ Login successful!');
            
            // Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            resultEl.innerHTML = `
                <div class="verified-data">
                    <h4>Login Successful!</h4>
                    <p><strong>Tourist ID:</strong> ${data.user.touristId}</p>
                    <p><strong>Name:</strong> ${data.user.name}</p>
                    <p><strong>Email:</strong> ${data.user.email}</p>
                    <p><strong>Blockchain ID:</strong> ${data.user.blockchainId}</p>
                    <p><strong>Itinerary End Date:</strong> ${new Date(data.user.itineraryEndDate).toLocaleDateString()}</p>
                    <p><strong>Token:</strong> ${data.token.substring(0, 50)}...</p>
                </div>
            `;
        } else {
            showStatus(statusEl, 'error', data.error || 'Login failed');
            resultEl.innerHTML = '';
        }
    } catch (error) {
        showStatus(statusEl, 'error', `Error: ${error.message}`);
        resultEl.innerHTML = '';
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

// Reset flow
function resetFlow() {
    onboardingResult = null;
    capturedImageBlob = null;
    
    // Stop camera if running
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Reset forms
    document.getElementById('registrationForm').reset();
    document.getElementById('loginForm').reset();
    setDefaultDates();
    
    // Reset image capture
    document.getElementById('video').style.display = 'none';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('startCameraBtn').style.display = 'inline-block';
    document.getElementById('captureBtn').style.display = 'none';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('photoInput').value = '';
    
    // Reset displays
    document.getElementById('onboardingStatus').innerHTML = '';
    document.getElementById('loginStatus').innerHTML = '';
    document.getElementById('loginResult').innerHTML = '';
    
    // Show onboarding form
    document.getElementById('onboardingForm').style.display = 'block';
    document.getElementById('successScreen').style.display = 'none';
    document.getElementById('loginSection').style.display = 'none';
}

// Helper function to show status
function showStatus(element, type, message) {
    element.className = `status ${type}`;
    element.innerHTML = `<span>${message}</span>`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (element.classList.contains('success')) {
                element.innerHTML = '';
            }
        }, 5000);
    }
}
