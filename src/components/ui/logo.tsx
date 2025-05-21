
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
