// API Configuration
const API_BASE_URL = 'http://localhost:3001/api/airport';

let html5QrCode = null;
let isScanning = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkApiStatus();
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

// Start QR Scanner
async function startScanner() {
    if (isScanning) return;

    try {
        const statusEl = document.getElementById('scanStatus');
        const resultEl = document.getElementById('scanResult');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');

        // Initialize scanner
        html5QrCode = new Html5Qrcode("qr-reader");
        
        showStatus(statusEl, 'loading', 'Starting camera...');

        // Start scanning
        await html5QrCode.start(
            { facingMode: "environment" }, // Use back camera if available
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            },
            (decodedText, decodedResult) => {
                // QR code scanned successfully
                handleQRScan(decodedText);
            },
            (errorMessage) => {
                // Ignore scanning errors (just keep scanning)
            }
        );

        isScanning = true;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        showStatus(statusEl, 'success', 'Scanner active - Point camera at QR code');
        resultEl.innerHTML = '';

    } catch (error) {
        console.error('Scanner error:', error);
        showStatus(document.getElementById('scanStatus'), 'error', `Scanner error: ${error.message}`);
    }
}

// Stop QR Scanner
async function stopScanner() {
    if (!isScanning || !html5QrCode) return;

    try {
        await html5QrCode.stop();
        await html5QrCode.clear();
        html5QrCode = null;
        isScanning = false;

        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('stopBtn').style.display = 'none';
        showStatus(document.getElementById('scanStatus'), 'success', 'Scanner stopped');
    } catch (error) {
        console.error('Error stopping scanner:', error);
    }
}

// Handle QR Code Scan
async function handleQRScan(qrCodeData) {
    if (!isScanning) return;

    const statusEl = document.getElementById('scanStatus');
    const resultEl = document.getElementById('scanResult');

    // Stop scanner immediately to prevent multiple scans
    await stopScanner();

    // Extract blockchain ID from QR code data
    // Format: "BLOCKCHAIN_ID:0x..."
    let blockchainId = null;

    if (qrCodeData.startsWith('BLOCKCHAIN_ID:')) {
        // New format: Direct blockchain ID
        blockchainId = qrCodeData.replace('BLOCKCHAIN_ID:', '');
    } else if (qrCodeData.includes('verify-qr?token=')) {
        // Legacy format: URL with token
        try {
            const url = new URL(qrCodeData);
            const token = url.searchParams.get('token');
            if (token) {
                // Use legacy token-based verification
                showStatus(statusEl, 'loading', 'Verifying QR code...');
                const response = await fetch(`${API_BASE_URL}/verify-qr?token=${token}`, {
                    method: 'GET',
                });
                const data = await response.json();
                handleVerificationResponse(response, data, statusEl, resultEl);
                return;
            }
        } catch (e) {
            // Not a valid URL, try as direct blockchain ID
        }
    } else if (/^0x[a-fA-F0-9]{40}$/.test(qrCodeData)) {
        // Direct blockchain ID without prefix
        blockchainId = qrCodeData;
    }

    if (!blockchainId) {
        showStatus(statusEl, 'error', 'Invalid QR code format');
        resultEl.innerHTML = '<div class="error">QR code does not contain a valid blockchain ID</div>';
        return;
    }

    // Validate blockchain ID format
    if (!/^0x[a-fA-F0-9]{40}$/.test(blockchainId)) {
        showStatus(statusEl, 'error', 'Invalid blockchain ID format');
        resultEl.innerHTML = '<div class="error">Invalid blockchain ID format in QR code</div>';
        return;
    }

    // Display blockchain ID immediately
    showStatus(statusEl, 'success', '✅ QR Code Scanned!');
    resultEl.innerHTML = `
        <div class="verified-data">
            <h4>📱 QR Code Scanned</h4>
            <p><strong>Blockchain ID:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0; word-break: break-all; font-family: monospace;">
                ${blockchainId}
            </div>
            <p>Verifying and logging in...</p>
        </div>
    `;

    showStatus(statusEl, 'loading', 'Verifying QR code and logging in...');

    try {
        // Verify QR code using blockchain ID
        const response = await fetch(`${API_BASE_URL}/verify-qr?blockchainId=${encodeURIComponent(blockchainId)}`, {
            method: 'GET',
        });

        const data = await response.json();
        handleVerificationResponse(response, data, statusEl, resultEl);
    } catch (error) {
        showStatus(statusEl, 'error', `Error: ${error.message}`);
        resultEl.innerHTML = `
            <div class="error">
                <p>Failed to verify QR code. Please try again.</p>
                <button onclick="startScanner()" class="primary">Try Again</button>
            </div>
        `;
    }
}

// Handle verification response
function handleVerificationResponse(response, data, statusEl, resultEl) {

    if (response.ok && data.success) {
        showStatus(statusEl, 'success', '✅ QR code verified! Login successful.');

        // Store token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('blockchainId', data.user.blockchainId);
        localStorage.setItem('touristId', data.user.touristId);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Display success
        resultEl.innerHTML = `
            <div class="verified-data">
                <h4>Login Successful!</h4>
                <p><strong>Tourist ID:</strong> ${data.user.touristId}</p>
                <p><strong>Name:</strong> ${data.user.name}</p>
                <p><strong>Email:</strong> ${data.user.email}</p>
                <p><strong>Blockchain ID:</strong> ${data.user.blockchainId}</p>
                <p class="note">✅ This QR code has been used and is now invalid.</p>
            </div>
        `;

        // Redirect after 3 seconds
        setTimeout(() => {
            alert('Redirecting to dashboard...');
            // window.location.href = '/dashboard'; // Uncomment when dashboard is ready
        }, 3000);

    } else {
        showStatus(statusEl, 'error', data.error || 'QR code verification failed');
        
        let errorDetails = '';
        if (data.used) {
            errorDetails = '<p class="error">This QR code has already been used.</p>';
        } else if (data.expired) {
            errorDetails = '<p class="error">This QR code has expired.</p>';
        }

        resultEl.innerHTML = `
            <div class="error">
                <h4>Verification Failed</h4>
                <p>${data.error || 'Invalid QR code'}</p>
                ${errorDetails}
                <button onclick="startScanner()" class="primary">Try Again</button>
            </div>
        `;
    }
}

// Helper function to show status
function showStatus(element, type, message) {
    element.className = `status ${type}`;
    element.innerHTML = `<span>${message}</span>`;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (isScanning && html5QrCode) {
        stopScanner();
    }
});

