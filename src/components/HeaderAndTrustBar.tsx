import React, { useEffect, useRef, useState } from 'react';
import { TRUST_BAR_ITEMS, TreatmentCategoryId } from '../utils/treatments';

interface HeaderAndTrustBarProps {
  activeCategory: TreatmentCategoryId | null;
  onSelectCategory: (category: TreatmentCategoryId) => void;
  onOpenAbout: () => void;
  onOpenLogin: () => void;
  onResetFilter: () => void;
}

export const HeaderAndTrustBar: React.FC<HeaderAndTrustBarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenAbout,
  onOpenLogin,
  onResetFilter,
}) => {
  const [logoImgError, setLogoImgError] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const repeatedTrustItems = [...TRUST_BAR_ITEMS, ...TRUST_BAR_ITEMS, ...TRUST_BAR_ITEMS];

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof window === 'undefined') return;
    const syncHeaderHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty('--header-h', `${h}px`);
      }
    };
    syncHeaderHeight();
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(syncHeaderHeight)
        : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', syncHeaderHeight, { passive: true });
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', syncHeaderHeight);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      id="site-header"
      className="sticky top-0 z-40 bg-[#F6F3EC] border-b border-[#14352B]/12"
    >
      {/* Primary Navigation Row (Solid Cream #F6F3EC so section colours never bleed through) */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-[62px] md:h-[76px] flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Attached suga.health Live Naturally Logo Inside a White Rounded Container with 1px Hairline Border */}
        <button
          type="button"
          onClick={onResetFilter}
          aria-label="suga.health — Live Naturally home"
          className="group relative flex items-center justify-center bg-white rounded-xl px-2.5 py-1 md:px-3.5 md:py-1.5 border border-[#14352B]/12 shadow-[0_2px_8px_-2px_rgba(20,53,43,0.06)] hover:border-[#14352B]/25 transition-all duration-200 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14352B]"
        >
          {!logoImgError ? (
            <span className="block h-[34px] md:h-[42px] aspect-[1345/500] overflow-hidden relative rounded-[4px]">
              <img
                src="/assets/aistudio/Suga.health_Live_Naturally_Logo_bb84b822.png"
                alt="suga.health Live Naturally"
                width={1473}
                height={1068}
                decoding="async"
                onError={() => setLogoImgError(true)}
                className="w-full h-full object-cover object-[50%_52%] scale-[1.04] block"
              />
            </span>
          ) : (
            <span className="flex flex-col items-center justify-center px-3 py-1 rounded-[5px] bg-white">
              <span className="text-[18px] font-bold tracking-tight leading-none text-[#08518F]">
                suga<span className="text-[#C81E1E]">.</span>health
              </span>
              <span className="font-editorial italic text-[13px] leading-none text-[#C81E1E] -mt-0.5">
                Live Naturally
              </span>
            </span>
          )}
          <span className="sr-only">suga.health Live Naturally</span>
        </button>

        {/* Zone 2: Center Navigation Links in Deep Forest Green (#14352B) */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-9">
          <button
            type="button"
            onClick={onOpenAbout}
            className="text-[14.5px] font-medium text-[#14352B]/80 hover:text-[#14352B] transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#14352B] hover:after:w-full after:transition-all"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory('weight-loss')}
            className={`text-[14.5px] transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#14352B] after:transition-all ${
              activeCategory === 'weight-loss'
                ? 'text-[#14352B] font-semibold after:w-full'
                : 'font-medium text-[#14352B]/80 hover:text-[#14352B] after:w-0 hover:after:w-full'
            }`}
          >
            Weight Loss
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory('hair-growth')}
            className={`text-[14.5px] transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#14352B] after:transition-all ${
              activeCategory === 'hair-growth'
                ? 'text-[#14352B] font-semibold after:w-full'
                : 'font-medium text-[#14352B]/80 hover:text-[#14352B] after:w-0 hover:after:w-full'
            }`}
          >
            Hair Growth
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory('sexual-health')}
            className={`text-[14.5px] transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#14352B] after:transition-all ${
              activeCategory === 'sexual-health'
                ? 'text-[#14352B] font-semibold after:w-full'
                : 'font-medium text-[#14352B]/80 hover:text-[#14352B] after:w-0 hover:after:w-full'
            }`}
          >
            Sexual Health
          </button>
        </nav>

        {/* Zone 3: Right Action — Login Button Alone (No Profile Icon) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenLogin}
            className="px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-[#14352B]/20 bg-white hover:bg-[#14352B] hover:text-white hover:border-[#14352B] text-[13px] md:text-[13.5px] font-semibold text-[#14352B] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Login
          </button>
        </div>
      </div>

      {/* Ticker: Solid Cream (#F6F3EC) Background, #14352B at 85% Opacity, Font-Weight 600, Size 12-13px, Letter-Spacing 0.12em, Uppercase, Red Diamonds */}
      <div
        aria-label="Clinical trust guarantees"
        className="bg-[#F6F3EC] border-t border-[#14352B]/10 h-[32px] md:h-[38px] flex items-center overflow-hidden select-none"
      >
        <div className="animate-marquee flex items-center">
          {repeatedTrustItems.map((item, idx) => (
            <div key={`${item}-${idx}`} className="flex items-center shrink-0">
              <span className="text-[12px] sm:text-[12.5px] font-semibold tracking-[0.12em] uppercase text-[#14352B]/85 px-6 whitespace-nowrap">
                {item}
              </span>
              <span
                aria-hidden="true"
                className="text-[#B82927] text-[10px] leading-none inline-block"
              >
                ✦
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};
