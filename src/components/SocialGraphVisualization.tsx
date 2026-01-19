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
}

const SocialGraphVisualization: React.FC<SocialGraphVisualizationProps> = ({ 
    data, 
    width, 
    height,
    onNodeClick 
}) => {
    const fgRef = useRef<ForceGraphMethods>(null);

    // Cache images to prevent reloading them on every frame
    const imagesCache = useMemo(() => new Map<string, HTMLImageElement>(), []);

    const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.farcasterUsername;
        const fontSize = 12/globalScale;
        const radius = 5; 
        
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
        const radius = 5; 
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

    return (
        <div className="relative w-full h-full">
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
            </div>
        </div>
    </div>
    );
};

export default SocialGraphVisualization;
