'use client';

/**
 * InteractiveMediaOverlay — draggable, resizable screen share + camera overlay.
 *
 * Features:
 * - Screen share video in a draggable, resizable container
 * - Minimize/maximize toggle (collapses to a small pill)
 * - Camera overlay (picture-in-picture style) on top of screen share
 * - Camera can be toggled on/off and repositioned independently
 * - All viewers see the same media but control their own layout
 *
 * Uses mouse/touch events for drag (no external drag library needed).
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveMediaOverlayProps {
    /** Name of the person sharing their screen */
    sharerName: string;
    /** Ref callback to attach the screen share video track */
    onScreenVideoRef: (el: HTMLVideoElement | null) => void;
    /** Whether the local user has their camera enabled */
    isCameraOn: boolean;
    /** Toggle camera on/off */
    onToggleCamera: () => void;
    /** Ref callback to attach the local camera track */
    onCameraVideoRef: (el: HTMLVideoElement | null) => void;
    /** Whether camera is available (host/speaker only) */
    canUseCamera: boolean;
}

/**
 * Clamp a value between min and max, ensuring the overlay stays on screen.
 */
function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

type ViewMode = 'maximized' | 'floating' | 'minimized';

export default function InteractiveMediaOverlay({
    sharerName,
    onScreenVideoRef,
    isCameraOn,
    onToggleCamera,
    onCameraVideoRef,
    canUseCamera,
}: InteractiveMediaOverlayProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('maximized');

    // ── Floating position (for 'floating' mode) ──
    const [position, setPosition] = useState({ x: 16, y: 80 });
    const [size, setSize] = useState({ w: 480, h: 300 });
    const isDragging = useRef(false);
    const isResizing = useRef(false);
    const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

    // ── Camera PiP position ──
    const [camPos, setCamPos] = useState({ x: 12, y: 12 });
    const isDraggingCam = useRef(false);
    const camDragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

    // ── Drag handlers for screen share ──
    const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDragging.current = true;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStart.current = { x: clientX, y: clientY, posX: position.x, posY: position.y };
    }, [position]);

    const onDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging.current) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const dx = clientX - dragStart.current.x;
        const dy = clientY - dragStart.current.y;
        setPosition({
            x: clamp(dragStart.current.posX + dx, 0, window.innerWidth - size.w),
            y: clamp(dragStart.current.posY + dy, 0, window.innerHeight - size.h),
        });
    }, [size]);

    const onDragEnd = useCallback(() => { isDragging.current = false; }, []);

    // ── Resize handlers ──
    const onResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = true;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        resizeStart.current = { x: clientX, y: clientY, w: size.w, h: size.h };
    }, [size]);

    const onResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isResizing.current) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const dx = clientX - resizeStart.current.x;
        const dy = clientY - resizeStart.current.y;
        setSize({
            w: clamp(resizeStart.current.w + dx, 240, window.innerWidth - position.x),
            h: clamp(resizeStart.current.h + dy, 160, window.innerHeight - position.y),
        });
    }, [position]);

    const onResizeEnd = useCallback(() => { isResizing.current = false; }, []);

    // ── Camera PiP drag ──
    const onCamDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isDraggingCam.current = true;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        camDragStart.current = { x: clientX, y: clientY, posX: camPos.x, posY: camPos.y };
    }, [camPos]);

    const onCamDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingCam.current) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const dx = clientX - camDragStart.current.x;
        const dy = clientY - camDragStart.current.y;
        // Clamp within the screen share container
        const maxX = viewMode === 'maximized' ? window.innerWidth - 160 : size.w - 160;
        const maxY = viewMode === 'maximized' ? window.innerHeight - 120 : size.h - 120;
        setCamPos({
            x: clamp(camDragStart.current.posX + dx, 0, maxX),
            y: clamp(camDragStart.current.posY + dy, 0, maxY),
        });
    }, [viewMode, size]);

    const onCamDragEnd = useCallback(() => { isDraggingCam.current = false; }, []);

    // ── Global mouse/touch event listeners ──
    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            onDragMove(e);
            onResizeMove(e);
            onCamDragMove(e);
        };
        const handleEnd = () => {
            onDragEnd();
            onResizeEnd();
            onCamDragEnd();
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [onDragMove, onDragEnd, onResizeMove, onResizeEnd, onCamDragMove, onCamDragEnd]);

    // ── MINIMIZED: small pill ──
    if (viewMode === 'minimized') {
        return (
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setViewMode('floating')}
                className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-blue-500/90 backdrop-blur-sm text-white rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors"
            >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-medium">{sharerName}'s screen</span>
            </motion.button>
        );
    }

    // ── Shared header bar ──
    const headerBar = (
        <div className="flex items-center justify-between px-3 py-2 bg-black/80 backdrop-blur-sm border-b border-white/10 cursor-move select-none"
            onMouseDown={viewMode === 'floating' ? onDragStart : undefined}
            onTouchStart={viewMode === 'floating' ? onDragStart : undefined}
        >
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-blue-400 font-medium truncate">
                    {sharerName} is sharing
                </span>
                <span className="text-[10px] text-blue-400/60 uppercase tracking-wider font-bold">LIVE</span>
            </div>
            <div className="flex items-center gap-1">
                {/* Camera toggle */}
                {canUseCamera && (
                    <button
                        onClick={onToggleCamera}
                        className={`p-1.5 rounded-full transition-all ${isCameraOn ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60 hover:text-white'}`}
                        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                )}
                {/* View mode buttons */}
                {viewMode === 'maximized' ? (
                    <>
                        <button onClick={() => setViewMode('floating')} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors" title="Float (drag around)">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>
                        <button onClick={() => setViewMode('minimized')} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors" title="Minimize">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setViewMode('maximized')} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors" title="Maximize">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>
                        <button onClick={() => setViewMode('minimized')} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors" title="Minimize">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    // ── Camera PiP overlay (shared between maximized and floating) ──
    const cameraPip = isCameraOn && (
        <div
            className="absolute z-10 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-xl cursor-move"
            style={{ left: camPos.x, top: camPos.y, width: 140, height: 105 }}
            onMouseDown={onCamDragStart}
            onTouchStart={onCamDragStart}
        >
            <video
                ref={onCameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover bg-gray-900"
            />
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-white font-medium">
                You
            </div>
        </div>
    );

    // ── MAXIMIZED: inline block above controls ──
    if (viewMode === 'maximized') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 rounded-2xl overflow-hidden bg-black ring-2 ring-blue-500/30 shadow-2xl shadow-blue-500/10"
            >
                {headerBar}
                <div className="relative w-full" style={{ aspectRatio: '16/9', maxHeight: '60vh' }}>
                    <video
                        ref={onScreenVideoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                    />
                    {cameraPip}
                </div>
            </motion.div>
        );
    }

    // ── FLOATING: draggable, resizable window ──
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 rounded-2xl overflow-hidden bg-black ring-2 ring-blue-500/30 shadow-2xl shadow-blue-500/20"
            style={{
                left: position.x,
                top: position.y,
                width: size.w,
                height: size.h,
            }}
        >
            {headerBar}
            <div className="relative w-full" style={{ height: `calc(100% - 40px)` }}>
                <video
                    ref={onScreenVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                />
                {cameraPip}
            </div>
            {/* Resize handle — bottom-right corner */}
            <div
                className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-20"
                onMouseDown={onResizeStart}
                onTouchStart={onResizeStart}
            >
                <svg className="w-4 h-4 text-white/30 absolute bottom-0.5 right-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 22H20V20H22V22ZM22 18H18V22H22V18ZM22 14H14V22H22V14Z" />
                </svg>
            </div>
        </motion.div>
    );
}
