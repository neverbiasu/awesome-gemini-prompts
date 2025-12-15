"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

interface CompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function CompareSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
      }
    },
    []
  );

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (isDragging) {
        handleMove(e.touches[0].clientX);
      }
    },
    [isDragging, handleMove]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove as any);
      window.addEventListener("touchend", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove as any);
      window.removeEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove as any);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div 
      className={`relative w-full h-[400px] overflow-hidden rounded-xl cursor-ew-resize select-none group ${className}`}
      ref={containerRef}
      onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
      }}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <span className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>

      {/* Before Image (Foreground - Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <span className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm">
          {beforeLabel}
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 hover:w-1.5 transition-all"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center gap-0.5">
             <div className="w-0.5 h-3 bg-gray-400" />
             <div className="w-0.5 h-3 bg-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
