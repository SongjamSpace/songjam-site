"use client";

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';

interface SocialGraphVisualizationProps {
    data: {
        nodes: any[];
        links: any[];
    };
    width: number;
    height: number;
    onNodeClick?: (node: any) => void;
    contextLabel?: string;
}

const SocialGraphVisualization: React.FC<SocialGraphVisualizationProps> = ({ 
    data, 
    width, 
    height,
    onNodeClick,
    contextLabel 
}) => {
    const fgRef = useRef<ForceGraphMethods>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Cache images to prevent reloading them on every frame
    const imagesCache = useMemo(() => new Map<string, HTMLImageElement>(), []);

    const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.farcasterUsername;
        const fontSize = 12/globalScale;
        // Make root node larger
        const radius = node.type === 'root' ? 15 : 5; 
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.type === 'following' ? '#a855f7' : '#ec4899'; // Purple for following, Pink for followers
        ctx.fill();

        // Draw image if available
        if (node.pfpUrl) {
            let img = imagesCache.get(node.pfpUrl);
            if (!img) {
                img = new Image();
                img.src = node.pfpUrl;
                img.crossOrigin = "Anonymous"; // Important for canvas export if needed
                imagesCache.set(node.pfpUrl, img);
            }

            if (img.complete && img.naturalHeight !== 0) {
                 ctx.save();
                 ctx.beginPath();
                 ctx.arc(node.x, node.y, radius, 0, Math.PI * 2, true);
                 ctx.closePath();
                 ctx.clip();
                 try {
                    ctx.drawImage(img, node.x - radius, node.y - radius, radius * 2, radius * 2);
                 } catch(e) {
                     // ignore image error
                 }
                 ctx.restore();
            }
        }
    }, [imagesCache]);

    const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
        const radius = node.type === 'root' ? 15 : 5; 
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }, []);

    useEffect(() => {
        // Adjust forces
        if (fgRef.current) {
            fgRef.current.d3Force('charge')?.strength(-30);
            fgRef.current.d3Force('collide')?.radius(8); // Radius + padding
            // @ts-ignore
            fgRef.current.d3Force('link')?.distance((link: any) => link.distance || 30);
        }
    }, [data]); // Re-run if data changes? actually d3Force is persistent, but if links are recreated...

    const handleZoomIn = () => {
        if (fgRef.current) {
            fgRef.current.zoom(fgRef.current.zoom() * 1.5, 100);
        }
    };

    const handleZoomOut = () => {
        if (fgRef.current) {
            fgRef.current.zoom(fgRef.current.zoom() / 1.5, 100);
        }
    };

    const handleShare = () => {
        if (!containerRef.current) return;

        // Find the canvas element
        const canvas = containerRef.current.querySelector('canvas');
        if (!canvas) return;

        try {
            // Create a temporary link to download
            const link = document.createElement('a');
            link.download = `social-graph-${new Date().toISOString()}.png`;
            
            // Create a temporary canvas to add background color
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const ctx = tempCanvas.getContext('2d');
            
            if (ctx) {
                // Fill background (matching app theme broadly, or black)
                ctx.fillStyle = '#0f172a'; // slate-900
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Draw original canvas over it
                ctx.drawImage(canvas, 0, 0);
                
                // --- Add Watermark ---
                const padding = 40; // bottom-left padding
                const x = padding;
                const y = tempCanvas.height - padding;

                ctx.save();
                
                // Scaling factor based on canvas width
                const scale = Math.max(1, tempCanvas.width / 1200);

                // 1. Top Context Label
                if (contextLabel) {
                    ctx.font = `600 ${24 * scale}px sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(contextLabel, tempCanvas.width / 2, 40 * scale);
                }

                // 2. Bottom Watermark: SONGJAM / .space
                // Text: SONGJAM
                ctx.font = `900 ${48 * scale}px sans-serif`; 
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; 
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                ctx.fillText('SONGJAM', x, y - (24 * scale));

                // Subtitle: .space
                ctx.font = `${24 * scale}px monospace`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillText('SOCIAL GRAPH', x, y);

                ctx.restore();
                // ---------------------

                link.href = tempCanvas.toDataURL('image/png');
                link.click();

                // Share to Twitter
                const text = "I just took ownership of my social graph with @SongjamSpace\n\nTake ownership for yourself and launch your own Empire";
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(twitterUrl, '_blank');
            }
        } catch (err) {
            console.error('Failed to export image:', err);
            alert('Could not export image. This is likely due to security restrictions on the profile images (CORS).');
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <ForceGraph2D
                ref={fgRef}
            width={width}
            height={height}
            graphData={data}
            nodeLabel="farcasterUsername"
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={nodePointerAreaPaint}
            onNodeClick={onNodeClick}
            backgroundColor="rgba(0,0,0,0)" // Transparent
            minZoom={0.5}
            maxZoom={4}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            // Cooldown prevents infinite simulation but usually good to have some ticks
            cooldownTicks={100}
            
            // Link styling
            linkColor={() => "rgba(147, 51, 234, 0.15)"} // Purple-ish low opacity
            linkWidth={1}
            // Removed erroneous linkDistance prop, handled in useEffect via d3Force
            // Optional: particle effects for "active" look
            linkDirectionalParticles={1} 
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => "rgba(236, 72, 153, 0.6)"} // Pink particles
        />

        {/* Top Context Label Overlay */}
        {contextLabel && (
            <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none z-0">
                <span className="text-white/40 font-semibold text-lg tracking-wide">{contextLabel}</span>
            </div>
        )}

        <div className="absolute bottom-4 left-4 pointer-events-none select-none z-0">
            <h1 className="text-4xl font-black text-white/15 tracking-tighter uppercase leading-none">Songjam</h1>
            <p className="text-xs font-mono text-white/20 tracking-[0.2em] uppercase pl-1">Social Graph</p>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2 z-50">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">Zoom</span>
            <div className="flex flex-col bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden shadow-lg">
                <button 
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-slate-700/50 text-white transition-colors border-b border-slate-700/50 active:bg-slate-600"
                    aria-label="Zoom In"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
                <button 
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-slate-700/50 text-white transition-colors active:bg-slate-600"
                    aria-label="Zoom Out"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
                <div className="h-px bg-slate-700/50 my-0.5"></div>
                <button 
                    onClick={handleShare}
                    className="p-2 hover:bg-slate-700/50 text-white transition-colors active:bg-slate-600"
                    aria-label="Share & Export"
                    title="Share & Export"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
    );
};

export default SocialGraphVisualization;
