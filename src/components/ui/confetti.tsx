
import React, { useState, useEffect } from 'react';

interface ConfettiPieceProps {
  index: number;
  total: number;
}

const ConfettiPiece = ({ index, total }: ConfettiPieceProps) => {
  const colors = ['#FEFE00', '#F4F499', '#4CAF50', '#FFC107'];
  const color = colors[index % colors.length];
  const delay = (index / total) * 0.5;
  const leftPosition = `${(index / total) * 100}%`;
  const size = Math.floor(Math.random() * 10) + 5; // 5-15px
  
  return (
    <div 
      className="absolute bottom-0 rounded-md animate-confetti" 
      style={{ 
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        left: leftPosition,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

interface ConfettiProps {
  isActive: boolean;
  count?: number;
}

export const Confetti = ({ isActive, count = 50 }: ConfettiProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000); // Stop after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiPiece key={i} index={i} total={count} />
      ))}
    </div>
  );
};
