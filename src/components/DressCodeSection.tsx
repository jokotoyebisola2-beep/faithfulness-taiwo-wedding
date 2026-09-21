import { motion } from 'motion/react';
import type { WeddingContent } from '../types';

interface DressCodeSectionProps {
  content: WeddingContent['dressCode'];
}

export function DressCodeSection({ content }: DressCodeSectionProps) {
  if (!content.showSection) return null;

  return (
    <section
      id="dress-code-section"
      className="py-14 md:py-20 px-6 bg-[#FDFCF8] text-[#1B3022] text-center border-b border-[#1B3022]/5"
    >
      <div className="max-w-xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059] mb-2"
        >
          Attire Inspiration
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif-luxury text-3xl sm:text-4xl text-[#1B3022] mb-3"
        >
          {content.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl font-medium tracking-wide text-[#1B3022] mb-6"
        >
          {content.colors}
        </motion.p>

        {/* Color Palette Swatches */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-6 mb-6"
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xs border-2 border-white ring-1 ring-[#1B3022]/15"
              style={{ backgroundColor: content.primaryHex || '#4B0082' }}
            />
            <span className="text-[10px] tracking-widest uppercase font-semibold text-[#1B3022]">
              Purple
            </span>
          </div>

          <span className="text-[#C5A059] text-base font-serif italic">&amp;</span>

          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xs border-2 border-white ring-1 ring-[#1B3022]/15"
              style={{ backgroundColor: content.secondaryHex || '#2E8B57' }}
            />
            <span className="text-[10px] tracking-widest uppercase font-semibold text-[#1B3022]">
              Sea Green
            </span>
          </div>
        </motion.div>

        {content.description && (
          <p className="text-xs text-[#1B3022]/70 max-w-md mx-auto leading-relaxed">
            {content.description}
          </p>
        )}
      </div>
    </section>
  );
}
