import React from 'react';

// Version A: The Star Nested in the Bracket
export const Logo = ({ className = "w-8 h-8", color = "currentColor" }: { className?: string, color?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* The Prompt Bracket (>) */}
    {/* Stroke width adjusted for visibility at small sizes */}
    <path 
      d="M25 30 L50 50 L25 70" 
      stroke={color} 
      strokeWidth="10" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* The Gemini Star (Content) */}
    {/* Perfectly centered in the V shape */}
    <path 
      d="M78 30 C78 45 63 50 53 50 C63 50 78 55 78 70 C78 55 93 50 103 50 C93 50 78 45 78 30 Z" 
      fill={color}
    />
  </svg>
);

export default Logo;
