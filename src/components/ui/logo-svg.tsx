
import React from "react";
import ReactDOM from "react-dom";

interface LogoSVGProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export function LogoSVG({ 
  size = 512, 
  color = "#FEFE00", 
  backgroundColor = "#000000" 
}: LogoSVGProps) {
  // Calculate dimensions based on size
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
        fill={backgroundColor} 
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
        fill={color}
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

// Function to generate icon data URLs for different sizes
export function generateIconDataURLs() {
  const sizes = [72, 144, 192, 512];
  const icons: Record<string, string> = {};
  
  sizes.forEach(size => {
    // Convert SVG to data URL
    const svgElement = document.createElement('div');
    svgElement.style.position = 'absolute';
    svgElement.style.visibility = 'hidden';
    document.body.appendChild(svgElement);
    
    ReactDOM.render(<LogoSVG size={size} />, svgElement);
    
    const svgString = svgElement.innerHTML;
    const dataURL = `data:image/svg+xml;base64,${btoa(svgString)}`;
    
    icons[`icon-${size}x${size}`] = dataURL;
    
    document.body.removeChild(svgElement);
  });
  
  return icons;
}

export function downloadIcons() {
  const icons = generateIconDataURLs();
  
  Object.entries(icons).forEach(([name, dataURL]) => {
    const link = document.createElement('a');
    link.download = `${name}.svg`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
