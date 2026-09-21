import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import type { WeddingContent } from '../types';

interface CountdownSectionProps {
  content: WeddingContent['countdown'];
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function CountdownSection({ content }: CountdownSectionProps) {
  if (!content.showSection) return null;

  const calculateTime = (): TimeRemaining => {
    const target = new Date(content.targetDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isPast: false };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [content.targetDate]);

  return (
    <section
      id="countdown-section"
      className="py-14 md:py-20 px-6 bg-[#FDFCF8] text-[#1B3022] border-b border-[#1B3022]/5 text-center"
    >
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#C5A059] mb-6"
        >
          <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
          <span>Counting Down The Days</span>
          <Heart className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
        </motion.div>

        {timeLeft.isPast ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-white border border-[#1B3022]/10"
          >
            <p className="font-serif-luxury text-2xl md:text-3xl text-[#1B3022]">
              {content.passedMessage}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-[#1B3022]/10 shadow-xs">
              <span className="block font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal text-[#1B3022] leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#1B3022]/50 font-semibold mt-1.5 block">
                Days
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white border border-[#1B3022]/10 shadow-xs">
              <span className="block font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal text-[#1B3022] leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#1B3022]/50 font-semibold mt-1.5 block">
                Hours
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white border border-[#1B3022]/10 shadow-xs">
              <span className="block font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal text-[#1B3022] leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#1B3022]/50 font-semibold mt-1.5 block">
                Mins
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white border border-[#1B3022]/10 shadow-xs">
              <span className="block font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-normal text-[#1B3022] leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#1B3022]/50 font-semibold mt-1.5 block">
                Secs
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
