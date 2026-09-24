import React, { useState } from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'banner';
  showText?: boolean;
  className?: string;
  variant?: 'emblem' | 'full';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  variant = 'full',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'h-6 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto',
    banner: 'h-24 sm:h-32 w-auto max-w-full',
  };

  const containerSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    banner: 'w-full max-w-md',
  };

  if (imgError) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-slate-900 text-white font-black shadow-xs ring-1 ring-slate-800 ${containerSizes[size]} ${className}`}
      >
        <span className="text-xs tracking-tighter text-emerald-400">SKY</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center overflow-hidden rounded-xl">
        <img
          src="/skyadav-logo.png"
          alt="SKYadav Portfolio Logo"
          onError={() => setImgError(true)}
          className={`object-contain transition-transform duration-300 hover:scale-105 ${sizeClasses[size]}`}
        />
      </div>
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="font-extrabold tracking-tight text-slate-900 text-sm sm:text-base leading-tight">
            SKYadav
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-600 font-bold">
            Portfolio
          </span>
        </div>
      )}
    </div>
  );
};
