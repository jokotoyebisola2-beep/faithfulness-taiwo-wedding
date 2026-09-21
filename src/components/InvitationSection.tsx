import { motion } from 'motion/react';
import type { WeddingContent } from '../types';

interface InvitationSectionProps {
  content: WeddingContent['invitation'];
}

export function InvitationSection({ content }: InvitationSectionProps) {
  if (!content.showSection) return null;

  return (
    <section
      id="invitation-section"
      className="relative py-16 md:py-24 px-6 bg-[#FDFCF8] text-[#1B3022] flex flex-col items-center justify-center border-b border-[#1B3022]/5"
    >
      <div className="max-w-2xl mx-auto w-full text-center">
        {/* Monogram Crest */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 w-14 h-14 rounded-full border border-[#C5A059]/35 flex flex-col items-center justify-center bg-white shadow-xs"
        >
          <span className="font-serif-luxury text-lg font-bold tracking-wider text-[#1B3022]">
            F&amp;T
          </span>
          <span className="text-[8px] uppercase tracking-widest text-[#C5A059] font-semibold">
            2026
          </span>
        </motion.div>

        {/* Families Header */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="uppercase tracking-widest text-[10px] sm:text-xs opacity-60 mb-3 text-[#1B3022]"
        >
          {content.families}
        </motion.p>

        {/* Invitation Lead & Names */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl font-serif-luxury border-b border-[#C5A059]/30 pb-5 mb-5 max-w-xl mx-auto text-[#1B3022] leading-snug"
        >
          {content.invitationLead}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xs uppercase tracking-[0.25em] font-semibold text-[#C5A059] mb-6"
        >
          {content.coupleNames}
        </motion.p>

        {/* Bible Verse */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="p-6 rounded-xl bg-white border border-[#1B3022]/5 shadow-xs max-w-lg mx-auto"
        >
          <blockquote className="font-serif-luxury italic text-base sm:text-lg text-[#1B3022]/90 leading-relaxed mb-2">
            &ldquo;{content.bibleVerse}&rdquo;
          </blockquote>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-[#C5A059]">
            {content.verseReference}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
