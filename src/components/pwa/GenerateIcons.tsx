
import React, { useEffect, useRef } from 'react';
import { LogoSVG } from '@/components/ui/logo-svg';

const GenerateIcons = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const generateIcon = (size: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve('');
      
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');
      
      // Draw background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);
      
      // Create temporary SVG image
      const svg = new Blob(
        [
          `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <rect width="${size}" height="${size}" fill="#000000" rx="${size * 0.1}" />
            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
                  font-family="'Franklin Gothic Heavy', 'Montserrat Black', sans-serif" 
                  font-size="${size * 0.6}" font-weight="900" fill="#FEFE00" 
                  style="text-shadow: 0 0 ${size * 0.02}px rgba(254, 254, 0, 0.3); letter-spacing: -0.05em;">
              WE
            </text>
          </svg>`
        ],
        { type: 'image/svg+xml' }
      );
      
      const url = URL.createObjectURL(svg);
      const img = new Image();
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      
      img.src = url;
    });
  };
  
  const downloadIcon = async (size: number) => {
    const dataUrl = await generateIcon(size);
    const link = document.createElement('a');
    link.download = `icon-${size}x${size}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  useEffect(() => {
    // Generate icons when component mounts
    const generateAllIcons = async () => {
      const sizes = [72, 144, 192, 512];
      for (const size of sizes) {
        await downloadIcon(size);
      }
    };
    
    // Uncomment this line to automatically generate icons on mount
    // generateAllIcons();
  }, []);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">PWA Icon Generator</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col items-center">
          <LogoSVG size={72} />
          <button 
            className="mt-2 px-2 py-1 bg-sunshine text-midnight text-xs rounded"
            onClick={() => downloadIcon(72)}>
            Download 72×72
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <LogoSVG size={144} />
          <button 
            className="mt-2 px-2 py-1 bg-sunshine text-midnight text-xs rounded"
            onClick={() => downloadIcon(144)}>
            Download 144×144
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <LogoSVG size={192} />
          <button 
            className="mt-2 px-2 py-1 bg-sunshine text-midnight text-xs rounded"
            onClick={() => downloadIcon(192)}>
            Download 192×192
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <LogoSVG size={512} />
          <button 
            className="mt-2 px-2 py-1 bg-sunshine text-midnight text-xs rounded"
            onClick={() => downloadIcon(512)}>
            Download 512×512
          </button>
        </div>
      </div>
      
      <button 
        className="px-4 py-2 bg-mindaro text-midnight rounded"
        onClick={() => {
          const sizes = [72, 144, 192, 512];
          sizes.forEach(size => downloadIcon(size));
        }}>
        Download All Icons
      </button>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default GenerateIcons;
