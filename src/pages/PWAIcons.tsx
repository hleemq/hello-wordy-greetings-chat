
import React from 'react';
import GenerateIcons from '@/components/pwa/GenerateIcons';

const PWAIcons = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PWA Icon Generator</h1>
      <p className="mb-4">Use this tool to generate icons for your PWA. Icons will be downloaded when you click the buttons.</p>
      <GenerateIcons />
    </div>
  );
};

export default PWAIcons;
