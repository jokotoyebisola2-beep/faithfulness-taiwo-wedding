import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import type { WeddingContent } from '../types';

interface ClosingSectionProps {
  content: WeddingContent['closing'];
}

export function ClosingSection({ content }: ClosingSectionProps) {
  if (!content.showSection) return null;

  return (
    <footer
      id="closing-section"
      className="relative overflow-hidden bg-[#122218] text-[#FDFCF8] pt-16 pb-12 px-6 text-center"
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Final Couple Photograph */}
        {content.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-48 h-48 sm:w-60 sm:h-60 rounded-full overflow-hidden border-2 border-[#C5A059]/40 p-1 mb-8 shadow-2xl bg-[#1B3022]"
          >
            <img
              src={content.imageUrl}
              alt="Faithfulness & Taiwo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top rounded-full grayscale-[10%]"
            />
          </motion.div>
        )}

        {/* Closing Message */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs sm:text-sm uppercase tracking-[0.3em] font-medium text-[#C5A059] mb-4"
        >
          {content.message}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl text-[#FDFCF8] mb-6"
        >
          {content.coupleSign}
        </motion.h2>

        <div className="flex items-center justify-center gap-2 text-[#C5A059]/70 mb-10">
          <span className="h-px w-8 bg-[#C5A059]/40" />
          <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
          <span className="h-px w-8 bg-[#C5A059]/40" />
        </div>

        {/* Romantic Footer Attribution */}
        <div className="pt-6 border-t border-white/10 w-full text-center text-xs text-[#FDFCF8]/50">
          <p
            id="closing-footer-text"
            className="tracking-[0.22em] sm:tracking-[0.28em] uppercase text-[10px] sm:text-[11px] font-medium text-[#FDFCF8]/65"
          >
            FAITHFULNESS &amp; TAIWO &bull; 24 OCTOBER 2026 &bull; IBADAN &bull; NIGERIA
          </p>
        </div>
      </div>
    </footer>
  );
}
