import React from 'react';
import { ScreenshotData } from '../types';
import { cn } from '../utils/cn';
import { DeviceMockup } from './DeviceMockup';

interface ScreenshotCanvasProps {
  data: ScreenshotData;
  index?: number;
  total?: number;
  isPanorama?: boolean;
  scale?: number;
  className?: string;
}

export function ScreenshotCanvas({ data, index = 0, total = 1, isPanorama = false, scale = 1, className }: ScreenshotCanvasProps) {
  const { title, subtitle, appImage, template } = data;
  const { layout, background, titleColor, subtitleColor, fontFamily } = template;

  const isHex = background.startsWith('#') || background.startsWith('rgb');
  
  const containerStyle: React.CSSProperties = {
    background: isPanorama ? undefined : (isHex ? background : undefined),
    fontFamily: `"${fontFamily}", sans-serif`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const containerClass = cn(
    "relative overflow-hidden w-[414px] h-[896px] shadow-2xl flex flex-col shrink-0",
    (!isPanorama && !isHex) && background,
    className
  );

  return (
    <div className={containerClass} style={containerStyle}>
      {/* Global Panorama Background Layer */}
      {isPanorama && (
        <div 
          className="absolute top-0 bottom-0 pointer-events-none z-0"
          style={{ 
            width: `${total * 414}px`, 
            left: `-${index * 414}px`,
            background: 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #4c1d95 100%)',
          }}
        >
          {/* Decorative shapes that span across the entire panorama */}
          <div className="absolute top-[-10%] left-[10%] w-[800px] h-[800px] bg-indigo-500/30 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[40%] w-[1000px] h-[1000px] bg-fuchsia-500/20 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute top-[20%] left-[70%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[80px] mix-blend-screen"></div>
          
          {/* A continuous wave */}
          <svg className="absolute top-[60%] left-0 w-full h-[200px] opacity-20" preserveAspectRatio="none" viewBox="0 0 1000 100">
            <path d="M0,50 C200,100 300,0 500,50 C700,100 800,0 1000,50" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {layout === 'text-top' && (
          <div className="flex flex-col h-full">
            <div className="pt-24 px-12 text-center z-10 shrink-0">
              <h1 className="text-[2.75rem] font-bold mb-4 leading-[1.1]" style={{ color: titleColor }}>{title}</h1>
              <p className="text-xl opacity-90 leading-snug" style={{ color: subtitleColor }}>{subtitle}</p>
            </div>
            <div className="flex-1 relative mt-16 px-12 flex justify-center items-end">
              <DeviceMockup image={appImage} className="w-full h-[90%] translate-y-8" />
            </div>
          </div>
        )}

        {layout === 'text-bottom' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 relative mb-16 px-12 flex justify-center items-start pt-16">
              <DeviceMockup image={appImage} className="w-full h-[90%] -translate-y-8" />
            </div>
            <div className="pb-24 px-12 text-center z-10 shrink-0">
              <h1 className="text-[2.75rem] font-bold mb-4 leading-[1.1]" style={{ color: titleColor }}>{title}</h1>
              <p className="text-xl opacity-90 leading-snug" style={{ color: subtitleColor }}>{subtitle}</p>
            </div>
          </div>
        )}

        {layout === 'split-left' && (
          <div className="flex flex-row h-full items-center">
            <div className="w-1/2 pl-12 pr-6 z-10">
              <h1 className="text-4xl font-bold mb-4 leading-[1.1]" style={{ color: titleColor }}>{title}</h1>
              <p className="text-lg opacity-90 leading-snug" style={{ color: subtitleColor }}>{subtitle}</p>
            </div>
            <div className="w-1/2 relative h-full flex items-center justify-end pr-[-2rem]">
              <div className="w-[280px] h-[580px] translate-x-12 shrink-0">
                <DeviceMockup image={appImage} className="w-full h-full" />
              </div>
            </div>
          </div>
        )}

        {layout === 'split-right' && (
          <div className="flex flex-row h-full items-center">
            <div className="w-1/2 relative h-full flex items-center justify-start pl-[-2rem]">
              <div className="w-[280px] h-[580px] -translate-x-12 shrink-0">
                <DeviceMockup image={appImage} className="w-full h-full" />
              </div>
            </div>
            <div className="w-1/2 pr-12 pl-6 z-10 text-right">
              <h1 className="text-4xl font-bold mb-4 leading-[1.1]" style={{ color: titleColor }}>{title}</h1>
              <p className="text-lg opacity-90 leading-snug" style={{ color: subtitleColor }}>{subtitle}</p>
            </div>
          </div>
        )}

        {layout === 'angled-right' && (
          <div className="flex flex-col h-full">
            <div className="pt-24 px-12 text-left z-10 shrink-0">
              <h1 className="text-[2.75rem] font-bold mb-4 leading-[1.1]" style={{ color: titleColor }}>{title}</h1>
              <p className="text-xl opacity-90 leading-snug" style={{ color: subtitleColor }}>{subtitle}</p>
            </div>
            <div className="flex-1 relative mt-16 px-12 flex justify-center items-end">
              <div className="w-full h-[120%] origin-bottom-right rotate-12 translate-x-16 translate-y-32">
                <DeviceMockup image={appImage} className="w-full h-full" />
              </div>
            </div>
          </div>
        )}

        {layout === 'panorama-right' && (
          <div className="flex flex-col h-full relative">
            <div className="pt-32 px-12 text-left z-10 shrink-0">
              <h1 className="text-[2.75rem] font-bold mb-4 leading-[1.1]" style={{ color: titleColor }}>{title}</h1>
              <p className="text-xl opacity-90 leading-snug" style={{ color: subtitleColor }}>{subtitle}</p>
            </div>
            <div className="absolute right-[-140px] bottom-20 w-[280px] h-[580px]">
              <DeviceMockup image={appImage} className="w-full h-full" />
            </div>
          </div>
        )}

        {layout === 'panorama-left' && (
          <div className="flex flex-col h-full relative">
            <div className="pt-32 px-12 text-right z-10 shrink-0">
              <h1 className="text-[2.75rem] font-bold mb-4 leading-[1.1]" style={{ color: titleColor }}>{title}</h1>
              <p className="text-xl opacity-90 leading-snug" style={{ color: subtitleColor }}>{subtitle}</p>
            </div>
            <div className="absolute left-[-140px] bottom-20 w-[280px] h-[580px]">
              <DeviceMockup image={appImage} className="w-full h-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
