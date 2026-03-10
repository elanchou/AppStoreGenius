import React from 'react';

interface DeviceMockupProps {
  image: string | null;
  className?: string;
}

export function DeviceMockup({ image, className = '' }: DeviceMockupProps) {
  return (
    <div className={`relative w-full h-full rounded-[3rem] border-[12px] border-black bg-black shadow-2xl overflow-hidden flex flex-col shrink-0 ${className}`}>
      {/* Dynamic Island */}
      <div className="absolute top-3 inset-x-0 h-7 bg-black rounded-full w-[120px] mx-auto z-20 flex items-center justify-end px-2">
        <div className="w-2 h-2 rounded-full bg-zinc-800/50 mr-1"></div>
      </div>
      
      {/* Screen Content */}
      <div className="w-full h-full bg-zinc-900 rounded-[2.2rem] overflow-hidden relative z-10 flex-1">
        {image ? (
          <img src={image} alt="App Screenshot" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm p-8 text-center bg-zinc-900">
            Upload an app screenshot to see it here
          </div>
        )}
      </div>
    </div>
  );
}
