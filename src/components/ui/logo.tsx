
import React from "react";

interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ showTagline = false, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl"
  };

  return (
    <div className="flex flex-col items-center">
      <div className="we-logo-container">
        <span className={`we-logo ${sizeClasses[size]}`}>WE</span>
      </div>
      {showTagline && <span className="we-tagline mt-1">Grow together</span>}
    </div>
  );
}

// This component can be used to generate SVG versions of the logo
export function LogoForSVG({ size = 512 }: { size?: number }) {
  const padding = size * 0.1;
  const fontSize = size * 0.6;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect 
        width={size} 
        height={size} 
        fill="#000000" 
        rx={size * 0.1} 
      />
      
      {/* WE Text */}
      <text 
        x="50%" 
        y="55%" 
        dominantBaseline="middle" 
        textAnchor="middle"
        fontFamily="'Franklin Gothic Heavy', 'Montserrat Black', sans-serif"
        fontSize={fontSize}
        fontWeight="900"
        fill="#FEFE00"
        style={{
          textShadow: `0 0 ${size * 0.02}px rgba(254, 254, 0, 0.3)`,
          letterSpacing: "-0.05em"
        }}
      >
        WE
      </text>
    </svg>
  );
}
