import { motion } from 'motion/react';
import { MapPin, Clock, Navigation } from 'lucide-react';
import type { WeddingContent } from '../types';

interface WeddingDaySectionProps {
  content: WeddingContent['weddingDay'];
}

export function WeddingDaySection({ content }: WeddingDaySectionProps) {
  if (!content.showSection) return null;

  return (
    <section
      id="wedding-day-section"
      className="py-16 md:py-24 px-6 bg-[#FDFCF8] text-[#1B3022] border-b border-[#1B3022]/5"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059] mb-2"
          >
            The Celebration
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl text-[#1B3022]"
          >
            The Wedding Day
          </motion.h2>
        </div>

        {/* 2-Column Clean Natural Tones Layout */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#1B3022]/5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {/* Ceremony Column */}
          <motion.div
            id="ceremony-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4 md:border-r md:border-[#1B3022]/10 md:pr-8 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-[#1B3022]/5 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-tighter text-[#C5A059]">
                  {content.ceremony.title}
                </span>
                <span className="text-[10px] opacity-60 font-medium">
                  {content.ceremony.time}
                </span>
              </div>

              <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#1B3022]">
                {content.ceremony.venue}
              </h3>

              <p className="text-xs leading-relaxed opacity-70">
                {content.ceremony.address}
              </p>

              <p className="text-[11px] uppercase tracking-wider text-[#1B3022]/50 font-medium">
                {content.ceremony.date}
              </p>
            </div>

            <div className="pt-3">
              <a
                id="ceremony-directions-link"
                href={content.ceremony.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold border-b border-[#1B3022] pb-0.5 hover:text-[#C5A059] hover:border-[#C5A059] transition-colors"
              >
                <span>Get Directions</span>
                <span className="text-[#C5A059]">&rarr;</span>
              </a>
            </div>
          </motion.div>

          {/* Reception Column */}
          <motion.div
            id="reception-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-[#1B3022]/5 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-tighter text-[#C5A059]">
                  {content.reception.title}
                </span>
                <span className="text-[10px] opacity-60 font-medium">
                  {content.reception.time}
                </span>
              </div>

              <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#1B3022]">
                {content.reception.venue}
              </h3>

              <p className="text-xs leading-relaxed opacity-70">
                {content.reception.address}
              </p>

              <p className="text-[11px] uppercase tracking-wider text-[#1B3022]/50 font-medium">
                {content.reception.date}
              </p>
            </div>

            <div className="pt-3">
              <a
                id="reception-directions-link"
                href={content.reception.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold border-b border-[#1B3022] pb-0.5 hover:text-[#C5A059] hover:border-[#C5A059] transition-colors"
              >
                <span>Get Directions</span>
                <span className="text-[#C5A059]">&rarr;</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
