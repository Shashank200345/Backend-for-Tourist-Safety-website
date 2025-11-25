import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  Copy,
  Loader2,
  LogIn,
  QrCode,
  RefreshCw,
  Shield,
  Upload,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API ?? 'http://localhost:3001/api/airport';

type ApiStatus = 'checking' | 'connected' | 'error';

type Gender = 'male' | 'female' | 'other';

interface RegistrationForm {
  name: string;
  email: string;
  aadhaarNumber: string;
  dob: string;
  gender: Gender;
  address: string;
  country: string;
  state: string;
  itineraryStartDate: string;
  itineraryEndDate: string;
}

interface OnboardingResponse {
  success: boolean;
  blockchainId: string;
  touristId: string;
  token: string;
  transactionHash?: string;
  user: {
    name: string;
    email: string;
    imageUrl?: string;
    itineraryStartDate?: string;
    itineraryEndDate?: string;
  };
  qrCode?: {
    qrCodeImage: string;
    qrCodeUrl: string;
    expiresAt: string;
  };
  message?: string;
  error?: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    touristId: string;
    name: string;
    email: string;
    blockchainId: string;
    itineraryEndDate: string;
  };
  error?: string;
}

const defaultDates = () => {
  const today = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);

  const toInput = (date: Date) => date.toISOString().split('T')[0];

  return {
    start: toInput(today),
    end: toInput(end),
  };
};

const initialForm: RegistrationForm = {
  name: '',
  email: '',
  aadhaarNumber: '',
  dob: '',
  gender: 'male',
  address: '',
  country: 'India',
  state: '',
  itineraryStartDate: defaultDates().start,
  itineraryEndDate: defaultDates().end,
};

export const TouristRegistration = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [formData, setFormData] = useState<RegistrationForm>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [onboardingResult, setOnboardingResult] = useState<OnboardingResponse | null>(null);

  const [loginBlockchainId, setLoginBlockchainId] = useState('');
  const [loginStatus, setLoginStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });
  const [loginResult, setLoginResult] = useState<LoginResponse | null>(null);

  const setDatesDefaults = useCallback(() => {
    const dates = defaultDates();
    setFormData((prev) => ({
      ...prev,
      itineraryStartDate: dates.start,
      itineraryEndDate: dates.end,
    }));
  }, []);

  useEffect(() => {
    setDatesDefaults();
  }, [setDatesDefaults]);

  useEffect(() => {
    const checkHealth = async () => {
      setApiStatus('checking');
      try {
        const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/../health`);
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        console.error('API status error', error);
        setApiStatus('error');
      }
    };
    checkHealth();
  }, []);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => stopCamera, []);

  const handleInputChange = (field: keyof RegistrationForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'itineraryStartDate') {
      setFormData((prev) => ({
        ...prev,
        itineraryStartDate: value,
        itineraryEndDate: prev.itineraryEndDate < value ? value : prev.itineraryEndDate,
      }));
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Only image files are allowed.' });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
    stopCamera();
  };

  const startCamera = async () => {
    try {
      stopCamera(); // Stop any existing stream first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setPhotoFile(null);
      setPhotoPreview('');
      setStatusMessage(null);
    } catch (error) {
      console.error('Camera error', error);
      setStatusMessage({
        type: 'error',
        text: 'Unable to access camera. Please allow camera permission or upload a photo.',
      });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!cameraStream || !video) {
      return;
    }

    video.muted = true;
    video.srcObject = cameraStream;

    const handleLoadedMetadata = () => {
      video.play().catch((error) => {
        console.error('Video play error:', error);
        setStatusMessage({
          type: 'error',
          text: 'Unable to start video playback. Please try again.',
        });
      });
    };

    if (video.readyState >= 2) {
      handleLoadedMetadata();
    } else {
      video.onloadedmetadata = handleLoadedMetadata;
    }

    return () => {
      video.pause();
      video.srcObject = null;
      video.onloadedmetadata = null;
    };
  }, [cameraStream]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setStatusMessage({ type: 'error', text: 'Camera not ready. Please wait for the video to load.' });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is actually ready and playing
    if (video.readyState < 2) {
      setStatusMessage({ type: 'error', text: 'Video is not ready yet. Please wait a moment and try again.' });
      return;
    }

    // Get actual video dimensions
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    
    if (width === 0 || height === 0) {
      setStatusMessage({ type: 'error', text: 'Video dimensions are invalid. Please restart the camera.' });
      return;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setStatusMessage({ type: 'error', text: 'Unable to initialize canvas. Please try again.' });
      return;
    }

    // Save the original (non-mirrored) image for KYC purposes
    // The video display is mirrored for UX, but we save the actual image
    ctx.drawImage(video, 0, 0, width, height);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setStatusMessage({ type: 'error', text: 'Failed to capture image. Please try again.' });
          return;
        }
        const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        setStatusMessage({ type: 'success', text: 'Photo captured successfully!' });
        stopCamera();
      },
      'image/jpeg',
      0.9
    );
  };

  const resetForm = () => {
    stopCamera();
    setFormData(initialForm);
    setDatesDefaults();
    setPhotoFile(null);
    setPhotoPreview('');
    setStatusMessage(null);
    setOnboardingResult(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Registering and anchoring tourist identity on blockchain...' });

    if (!photoFile) {
      setStatusMessage({ type: 'error', text: 'Please capture or upload a selfie/document photo before submitting.' });
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      setStatusMessage({ type: 'error', text: 'Aadhaar number must be exactly 12 digits.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('email', formData.email.trim());
      payload.append('aadhaarNumber', formData.aadhaarNumber.trim());
      payload.append('dob', formData.dob);
      payload.append('gender', formData.gender);
      payload.append('address', formData.address.trim());
      payload.append('country', formData.country.trim());
      payload.append('state', formData.state.trim());
      payload.append('itineraryStartDate', formData.itineraryStartDate);
      payload.append('itineraryEndDate', formData.itineraryEndDate);
      payload.append('photo', photoFile, photoFile.name || 'photo.jpg');

      const response = await fetch(`${API_BASE_URL}/onboard`, {
        method: 'POST',
        body: payload,
      });

      const data: OnboardingResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setOnboardingResult(data);
      localStorage.setItem('blockchainId', data.blockchainId);
      localStorage.setItem('touristId', data.touristId);
      localStorage.setItem('token', data.token);
      setLoginBlockchainId(data.blockchainId);
      setStatusMessage({ type: 'success', text: 'Tourist registered successfully. Credentials are ready for login.' });
    } catch (error: any) {
      console.error('Registration error', error);
      setStatusMessage({ type: 'error', text: error?.message ?? 'Unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatusMessage({ type: 'success', text: `${label} copied to clipboard.` });
    } catch (error) {
      console.error('Copy failed', error);
      setStatusMessage({ type: 'error', text: `Unable to copy ${label}.` });
    }
  };

  const generateNewQr = async () => {
    const blockchainId = onboardingResult?.blockchainId || localStorage.getItem('blockchainId');
    if (!blockchainId) {
      setStatusMessage({ type: 'error', text: 'Blockchain ID unavailable. Please complete registration first.' });
      return;
    }
    try {
      setStatusMessage({ type: 'info', text: 'Generating a fresh QR Code...' });
      const response = await fetch(`${API_BASE_URL}/generate-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockchainId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to generate QR code.');
      }
      setOnboardingResult((prev) =>
        prev
          ? {
              ...prev,
              qrCode: data.qrCode,
            }
          : prev
      );
      setStatusMessage({ type: 'success', text: 'New QR code generated successfully.' });
    } catch (error: any) {
      console.error('QR error', error);
      setStatusMessage({ type: 'error', text: error?.message ?? 'Failed to regenerate QR code.' });
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!loginBlockchainId) {
      setLoginStatus({ type: 'error', message: 'Enter your blockchain ID first.' });
      return;
    }
    setLoginStatus({ type: 'loading', message: 'Authenticating...' });
    setLoginResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockchainId: loginBlockchainId.trim() }),
      });
      const data: LoginResponse = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Verify the blockchain ID.');
      }
      setLoginResult(data);
      localStorage.setItem('token', data.token);
      setLoginStatus({ type: 'success', message: 'Login successful. Tourist profile synced.' });
    } catch (error: any) {
      console.error('Login error', error);
      setLoginStatus({ type: 'error', message: error?.message ?? 'Unable to login.' });
    }
  };

  const apiBadge = useMemo(() => {
    switch (apiStatus) {
      case 'connected':
        return { text: 'API Live', className: 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/40' };
      case 'error':
        return { text: 'API Offline', className: 'text-red-300 bg-red-500/20 border border-red-400/40' };
      default:
        return { text: 'Checking API...', className: 'text-yellow-300 bg-yellow-500/20 border border-yellow-400/40' };
    }
  }, [apiStatus]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 xl:grid-cols-5 gap-6"
      >
        <section className="xl:col-span-3 space-y-6">
          <div className="crypto-card p-6 lg:p-8 border border-crypto-border/60">
            <header className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-accent-gradient shadow-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-crypto-text-secondary">Secure Onboarding</p>
                  <h2 className="text-2xl font-semibold gradient-text">Blockchain Tourist Registration</h2>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${apiBadge.className}`}>
                {apiBadge.text}
              </span>
            </header>

            {statusMessage && (
              <div
                className={`mb-6 rounded-2xl border px-4 py-3 flex items-center gap-3 ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                    : statusMessage.type === 'error'
                    ? 'border-red-400/40 bg-red-500/10 text-red-100'
                    : 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100'
                }`}
              >
                {statusMessage.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5" />}
                <span className="text-sm font-medium">{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm">
                  Full Name
                  <input
                    className="crypto-input"
                    placeholder="e.g., Aarav Sharma"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Email
                  <input
                    type="email"
                    className="crypto-input"
                    placeholder="tourist@email.com"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Aadhaar Number
                  <input
                    className="crypto-input"
                    placeholder="12 digit Aadhaar"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange('aadhaarNumber')}
                    maxLength={12}
                    minLength={12}
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Date of Birth
                  <input
                    type="date"
                    className="crypto-input"
                    value={formData.dob}
                    onChange={handleInputChange('dob')}
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Gender
                  <select className="crypto-input" value={formData.gender} onChange={handleInputChange('gender')} required>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Country
                  <input className="crypto-input" value={formData.country} onChange={handleInputChange('country')} required />
                </label>
                <label className="flex flex-col gap-2 text-sm md:col-span-2">
                  Residential Address
                  <input
                    className="crypto-input"
                    placeholder="Full address used for verification"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  State / Region
                  <input className="crypto-input" value={formData.state} onChange={handleInputChange('state')} required />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Itinerary Start
                  <input
                    type="date"
                    className="crypto-input"
                    value={formData.itineraryStartDate}
                    onChange={handleInputChange('itineraryStartDate')}
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Itinerary End
                  <input
                    type="date"
                    min={formData.itineraryStartDate}
                    className="crypto-input"
                    value={formData.itineraryEndDate}
                    onChange={handleInputChange('itineraryEndDate')}
                    required
                  />
                </label>
              </div>

              <div className="border border-crypto-border/50 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Biometric Verification</h4>
                    <p className="text-sm text-crypto-text-secondary">Capture or upload a selfie for KYC</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="p-2 rounded-lg border border-crypto-border/40 hover:border-crypto-accent/40 transition"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <label className="p-2 rounded-lg border border-crypto-border/40 hover:border-crypto-accent/40 transition cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-dashed border-crypto-border/60 rounded-xl p-3 min-h-[220px] flex flex-col gap-3">
                    {cameraStream ? (
                      <>
                        <div className="relative w-full rounded-lg bg-black/20 overflow-hidden" style={{ minHeight: '200px' }}>
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="w-full h-full object-cover"
                            style={{ display: 'block', transform: 'scaleX(-1)' }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="crypto-btn flex-1" onClick={capturePhoto}>
                            Capture Photo
                          </button>
                          <button
                            type="button"
                            className="crypto-btn flex-1 bg-transparent border border-crypto-border/60 text-crypto-text-secondary hover:text-white"
                            onClick={stopCamera}
                          >
                            Stop
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 text-center text-crypto-text-secondary">
                        <Camera className="h-8 w-8 mb-3 opacity-60" />
                        <p className="text-sm">Start the camera or upload a photo to continue</p>
                      </div>
                    )}
                  </div>
                  <div className="border border-dashed border-crypto-border/60 rounded-xl p-3 min-h-[220px] flex items-center justify-center bg-black/20">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Captured preview" className="rounded-lg max-h-[200px] object-cover" />
                    ) : (
                      <p className="text-sm text-crypto-text-secondary text-center">
                        Captured/Uploaded image will appear here. This image is hashed and anchored on-chain.
                      </p>
                    )}
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="crypto-btn bg-transparent border border-crypto-border/60 text-crypto-text-secondary hover:border-crypto-accent/50"
                  disabled={isSubmitting}
                >
                  Reset
                </button>
                <button className="crypto-btn flex items-center justify-center gap-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="xl:col-span-2 space-y-6">
          <div className="crypto-card p-6 border border-crypto-border/60 space-y-4">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-crypto-text-secondary">Credentials Vault</p>
                <h3 className="text-xl font-semibold">Blockchain Identity Kit</h3>
              </div>
              {onboardingResult && (
                <button type="button" onClick={generateNewQr} className="p-2 rounded-lg border border-crypto-border/40 hover:border-crypto-accent/40 transition" title="Generate new QR">
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </header>

            {onboardingResult ? (
              <div className="space-y-4">
                <div className="border border-crypto-border/40 rounded-2xl p-4 bg-crypto-surface/40">
                  <p className="text-sm text-crypto-text-secondary mb-2">Blockchain ID</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm break-all">{onboardingResult.blockchainId}</span>
                    <button
                      type="button"
                      className="p-2 rounded-lg border border-crypto-border/40 hover:border-crypto-accent/40 transition"
                      onClick={() => copyToClipboard(onboardingResult.blockchainId, 'Blockchain ID')}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-crypto-border/40 rounded-2xl p-4 bg-crypto-surface/40 space-y-3">
                  <h4 className="text-sm text-crypto-text-secondary">Tourist Snapshot</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-crypto-text-secondary">
                    <div>
                      <p className="text-crypto-text-muted">Tourist ID</p>
                      <p className="font-semibold text-white">{onboardingResult.touristId}</p>
                    </div>
                    <div>
                      <p className="text-crypto-text-muted">Email</p>
                      <p className="font-semibold text-white">{onboardingResult.user.email}</p>
                    </div>
                    <div>
                      <p className="text-crypto-text-muted">Itinerary</p>
                      <p className="font-semibold text-white">
                        {onboardingResult.user.itineraryStartDate
                          ? new Date(onboardingResult.user.itineraryStartDate).toLocaleDateString()
                          : 'N/A'}{' '}
                        →{' '}
                        {onboardingResult.user.itineraryEndDate
                          ? new Date(onboardingResult.user.itineraryEndDate).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-crypto-text-muted">Transaction Hash</p>
                      <p className="font-semibold text-white text-xs break-all">
                        {onboardingResult.transactionHash ?? 'Pending'}
                      </p>
                    </div>
                  </div>
                  {onboardingResult.user.imageUrl && (
                    <div className="pt-3 border-t border-dashed border-crypto-border/40">
                      <p className="text-xs text-crypto-text-secondary mb-2">KYC Photo</p>
                      <img
                        src={onboardingResult.user.imageUrl}
                        alt={onboardingResult.user.name}
                        className="rounded-xl border border-crypto-border/40 max-h-[180px] object-cover"
                      />
                    </div>
                  )}
                </div>

                {onboardingResult.qrCode && (
                  <div className="border border-crypto-border/40 rounded-2xl p-4 bg-crypto-surface/40 text-center space-y-3">
                    <p className="text-sm flex items-center justify-center gap-2 text-crypto-text-secondary">
                      <QrCode className="h-4 w-4" />
                      Secure Login QR
                    </p>
                    <img
                      src={onboardingResult.qrCode.qrCodeImage}
                      alt="Tourist login QR"
                      className="max-w-[220px] mx-auto rounded-xl border border-crypto-border/40 bg-white p-2"
                    />
                    <p className="text-xs text-crypto-text-secondary">
                      Expires:{' '}
                      {new Date(onboardingResult.qrCode.expiresAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-crypto-text-secondary space-y-2">
                <p>Complete the registration to generate blockchain credentials, QR code, and Supabase synced profile.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Supports Aadhaar-based verification (UIDAI compliant hash storage)</li>
                  <li>Generates blockchain + Supabase records instantly</li>
                  <li>Produces QR token for frictionless login</li>
                </ul>
              </div>
            )}
          </div>

          <div className="crypto-card p-6 border border-crypto-border/60 space-y-4">
            <header className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-crypto-surface/60">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-crypto-text-secondary">Verify Credentials</p>
                <h3 className="text-xl font-semibold">Tourist Login Test</h3>
              </div>
            </header>

            <form onSubmit={handleLogin} className="space-y-3">
              <label className="text-sm flex flex-col gap-2">
                Blockchain ID
                <input
                  className="crypto-input font-mono text-xs"
                  placeholder="0x..."
                  value={loginBlockchainId}
                  onChange={(event) => setLoginBlockchainId(event.target.value)}
                  required
                />
              </label>
              <button className="crypto-btn w-full flex items-center justify-center gap-2" disabled={loginStatus.type === 'loading'}>
                {loginStatus.type === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                {loginStatus.type === 'loading' ? 'Checking...' : 'Login with Blockchain ID'}
              </button>
            </form>

            {loginStatus.type !== 'idle' && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  loginStatus.type === 'success'
                    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                    : loginStatus.type === 'error'
                    ? 'border-red-400/40 bg-red-500/10 text-red-100'
                    : 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100'
                }`}
              >
                {loginStatus.message}
              </div>
            )}

            {loginResult && (
              <div className="border border-crypto-border/40 rounded-2xl p-4 space-y-2 text-sm text-crypto-text-secondary">
                <p>
                  <span className="text-crypto-text-muted">Tourist ID:</span>{' '}
                  <span className="font-semibold text-white">{loginResult.user.touristId}</span>
                </p>
                <p>
                  <span className="text-crypto-text-muted">Name:</span>{' '}
                  <span className="font-semibold text-white">{loginResult.user.name}</span>
                </p>
                <p>
                  <span className="text-crypto-text-muted">Email:</span>{' '}
                  <span className="font-semibold text-white">{loginResult.user.email}</span>
                </p>
                <p>
                  <span className="text-crypto-text-muted">Itinerary Ends:</span>{' '}
                  <span className="font-semibold text-white">
                    {new Date(loginResult.user.itineraryEndDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default TouristRegistration;

