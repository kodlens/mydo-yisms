import { Alert, Button, Select, Space } from 'antd';
import { Camera, CameraOff, RefreshCw, SwitchCamera, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  onScan: (code: string) => void;
  disabled?: boolean;
};

export default function QrScanner({ onScan, disabled = false }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef<boolean>(false);
  const detectorRef = useRef<any>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Play a quick pleasant check-in beep on successful detection
  const playBeep = () => {
    if (!audioFeedback) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable or restricted
    }
  };

  // Enumerate cameras
  const getCameraDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setHasCamera(false);
        return;
      }
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Prefer environment/back camera if found
        const backCam = videoDevices.find((d) =>
          d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')
        );
        setSelectedDeviceId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
      }
    } catch {
      // Ignore device enumeration error
    }
  };

  // Start Camera Stream
  const startCamera = async (deviceId?: string) => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported on this browser or connection (HTTPS required).');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        startScanningLoop();
      }

      getCameraDevices();
    } catch (err: any) {
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please connect a webcam or use manual code entry.');
      } else {
        setCameraError(`Unable to start camera: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const stopCamera = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // QR Scanning Loop using native BarcodeDetector API
  const startScanningLoop = async () => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    // Initialize BarcodeDetector if available
    if ('BarcodeDetector' in window && !detectorRef.current) {
      try {
        detectorRef.current = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      } catch {
        detectorRef.current = null;
      }
    }

    const scanFrame = async () => {
      if (!scanningRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        if (scanningRef.current) {
          requestAnimationFrame(scanFrame);
        }
        return;
      }

      if (detectorRef.current && !disabled) {
        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue;
            if (rawVal && rawVal !== lastScanned) {
              setLastScanned(rawVal);
              playBeep();
              onScan(rawVal.trim());

              // Cooldown period before scanning the same code again
              setTimeout(() => {
                setLastScanned(null);
              }, 2500);
            }
          }
        } catch {
          // Frame detection dropped
        }
      }

      if (scanningRef.current) {
        requestAnimationFrame(scanFrame);
      }
    };

    requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    getCameraDevices();
    startCamera(selectedDeviceId);

    return () => {
      stopCamera();
    };
  }, [selectedDeviceId]);

  return (
    <div className="flex flex-col items-center">
      {/* Scanner Viewport */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-slate-700 bg-black shadow-lg">
        {/* Video stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-72 w-full object-cover sm:h-80 ${cameraActive ? 'block' : 'hidden'}`}
        />

        {/* Inactive or Error placeholder */}
        {!cameraActive && (
          <div className="flex h-72 w-full flex-col items-center justify-center p-6 text-center text-slate-400 sm:h-80">
            <CameraOff className="h-12 w-12 text-slate-500" />
            <p className="mt-3 text-sm font-semibold text-slate-200">Camera is inactive</p>
            {cameraError ? (
              <p className="mt-1 text-xs text-rose-400">{cameraError}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Click restart to connect camera</p>
            )}
            <Button
              type="primary"
              size="middle"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => startCamera(selectedDeviceId)}
              className="mt-4 !bg-emerald-700"
            >
              Start Camera
            </Button>
          </div>
        )}

        {/* Reticle / Aiming Frame Overlay */}
        {cameraActive && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Darkened corner vignette */}
            <div className="relative h-48 w-48 rounded-xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] sm:h-56 sm:w-56">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-emerald-400" />
              <div className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-emerald-400" />
              <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-emerald-400" />

              {/* Animated scanning beam */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-[bounce_2s_infinite]" />
            </div>

            {/* Instruction tooltip */}
            <div className="absolute bottom-4 rounded-full bg-black/70 px-4 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
              Align youth QR code inside the box
            </div>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="mt-3.5 flex w-full max-w-md items-center justify-between gap-2 px-1 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          {devices.length > 1 && (
            <Select
              size="small"
              value={selectedDeviceId}
              onChange={(val) => setSelectedDeviceId(val)}
              className="w-40"
              options={devices.map((d, index) => ({
                value: d.deviceId,
                label: d.label || `Camera ${index + 1}`,
              }))}
            />
          )}

          <Button
            size="small"
            type="text"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => startCamera(selectedDeviceId)}
            title="Restart Camera"
          >
            Restart
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setAudioFeedback(!audioFeedback)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          title={audioFeedback ? 'Sound enabled' : 'Sound muted'}
        >
          {audioFeedback ? (
            <>
              <Volume2 className="h-3.5 w-3.5 text-emerald-700" />
              <span>Chime On</span>
            </>
          ) : (
            <>
              <VolumeX className="h-3.5 w-3.5 text-slate-400" />
              <span>Muted</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
