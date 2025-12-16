import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DevicePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (deviceId: string, isUnmuted: boolean) => void;
}

const DevicePreviewModal: React.FC<DevicePreviewModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [devices, setDevices] = useState<{ deviceId: string; label: string }[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [isUnmuted, setIsUnmuted] = useState(true);
    const [permissionGranted, setPermissionGranted] = useState(false);

    // Audio Context & Analyser for visualization
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number>(null);

    // Fetch devices and request permission on mount if open
    useEffect(() => {
        if (!isOpen) {
            stopStream();
            return;
        }

        const initAudio = async () => {
            try {
                // Request microphone access to enumerate devices with labels and for visualization
                // Note: We use a generic constraint first
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setPermissionGranted(true);

                // Get devices
                const deviceInfos = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = deviceInfos
                    .filter(d => d.kind === 'audioinput')
                    .map(d => ({
                        deviceId: d.deviceId,
                        label: d.label || `Microphone ${d.deviceId.slice(0, 5)}...`
                    }));

                setDevices(audioInputs);

                // Set default if not set
                if (audioInputs.length > 0 && !selectedDeviceId) {
                    setSelectedDeviceId(audioInputs[0].deviceId);
                }

                // Stop the initial "permission" stream and start the actual one for the selected device
                stream.getTracks().forEach(track => track.stop());

                if (audioInputs.length > 0) {
                    startVisualization(audioInputs[0].deviceId);
                }

            } catch (err) {
                console.error("Error accessing microphone:", err);
                setPermissionGranted(false);
            }
        };

        if (isOpen) {
            initAudio();
        }

        return () => {
            stopStream();
        };
    }, [isOpen]);

    // Handle device change
    useEffect(() => {
        if (isOpen && selectedDeviceId && permissionGranted) {
            startVisualization(selectedDeviceId);
        }
    }, [selectedDeviceId, isOpen, permissionGranted]);

    const startVisualization = async (deviceId: string) => {
        stopStream(); // Stop any existing stream first

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: deviceId } }
            });
            streamRef.current = stream;

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            drawVisualization();

        } catch (err) {
            console.error("Error starting audio visualization:", err);
        }
    };

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const drawVisualization = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!analyserRef.current) return;
            animationFrameRef.current = requestAnimationFrame(draw);

            analyserRef.current.getByteFrequencyData(dataArray);

            // Simple visualization: Average volume bar
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Clear
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Bar
            // We'll draw a rounded bar that fills up based on volume
            const width = canvas.width;
            const height = canvas.height;
            const fillWidth = Math.min(width, (average / 128) * width * 1.5); // Amplify a bit

            // Background track
            canvasCtx.fillStyle = '#334155'; // Slate-700
            canvasCtx.beginPath();
            canvasCtx.roundRect(0, 0, width, height, height / 2);
            canvasCtx.fill();

            // Gradient fill
            const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, '#22c55e'); // Green-500
            gradient.addColorStop(1, '#3b82f6'); // Blue-500

            canvasCtx.fillStyle = gradient;
            canvasCtx.beginPath();
            canvasCtx.roundRect(0, 0, fillWidth, height, height / 2);
            canvasCtx.fill();
        };

        draw();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative Glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

                            <h2 className="text-xl font-bold text-white mb-1">Speaker Setup</h2>
                            <p className="text-slate-400 text-sm mb-6">Check your audio before you go live.</p>

                            {/* Device Selector */}
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Microphone
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedDeviceId}
                                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                                        className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 appearance-none border border-slate-700 focus:border-cyan-500 focus:outline-none transition-colors"
                                    >
                                        {devices.map(device => (
                                            <option key={device.deviceId} value={device.deviceId}>
                                                {device.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            {/* Audio Visualizer */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Mic Test
                                    </label>
                                    <span className="text-[10px] text-slate-500 uppercase">Speak to test</span>
                                </div>
                                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                                    <canvas
                                        ref={canvasRef}
                                        width={300}
                                        height={12}
                                        className="w-full h-3 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Initial Mute State Toggle */}
                            <div className="flex items-center justify-between mb-8 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <span className="text-sm font-medium text-slate-200">Join with mic on</span>
                                <button
                                    onClick={() => setIsUnmuted(!isUnmuted)}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${isUnmuted ? 'bg-cyan-500' : 'bg-slate-600'}`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${isUnmuted ? 'translate-x-6' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => onConfirm(selectedDeviceId, isUnmuted)}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DevicePreviewModal;
