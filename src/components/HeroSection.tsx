import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { WeddingContent } from '../types';

interface HeroSectionProps {
  content: WeddingContent['hero'];
  onExploreClick: () => void;
}

export function HeroSection({ content, onExploreClick }: HeroSectionProps) {
  return (
    <section
      id="hero-section"
      className="relative min-h-[92vh] md:min-h-screen w-full flex flex-col justify-between items-center text-center overflow-hidden bg-[#122218]"
    >
      {/* Background Image Container with Natural Tones grading */}
      <div className="absolute inset-0 z-0">
        <img
          id="hero-couple-image"
          src={content.imageUrl}
          alt={content.coupleNames}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[center_28%] scale-100 grayscale-[12%] transition-transform duration-1000 ease-out"
        />
        {/* Natural Tones Soft Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B3022]/95 via-[#1B3022]/35 to-[#122218]/65" />
      </div>

      {/* Top Monogram / Date Accent */}
      <div className="relative z-10 pt-10 md:pt-14 px-4 w-full flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#C5A059]/35 bg-[#1B3022]/60 backdrop-blur-xs text-[#FDFCF8]"
        >
          <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#FDFCF8]/90">
            Wedding Invitation
          </span>
          <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
        </motion.div>
      </div>

      {/* Center / Bottom Typography Hierarchy */}
      <div className="relative z-10 max-w-3xl px-6 pb-8 md:pb-12 mx-auto flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs uppercase tracking-[0.3em] text-[#FDFCF8]/80 font-normal mb-3"
        >
          {content.tagline}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#FDFCF8] leading-tight mb-4 drop-shadow-xs"
        >
          {content.coupleNames}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex items-center justify-center gap-3 text-[#C5A059] mb-8"
        >
          <span className="h-[1px] w-8 md:w-16 bg-[#C5A059]/40" />
          <p className="font-serif-luxury italic text-base sm:text-xl tracking-wider text-[#C5A059]">
            {content.dateDisplay}
          </p>
          <span className="h-[1px] w-8 md:w-16 bg-[#C5A059]/40" />
        </motion.div>

        {/* Scroll To Celebrate Indicator */}
        <motion.button
          id="scroll-to-celebrate-btn"
          type="button"
          onClick={onExploreClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="group flex flex-col items-center gap-2 text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-full p-2"
          aria-label="Scroll to celebrate"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce" />
            <span className="text-[9px] uppercase tracking-widest text-[#FDFCF8]/75 group-hover:text-[#FDFCF8]">
              {content.scrollIndicatorText}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-[#C5A059] group-hover:translate-y-0.5 transition-transform" />
        </motion.button>
      </div>
    </section>
  );
}
