import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Copy, Check, X, CreditCard } from 'lucide-react';
import type { WeddingContent, BankAccount } from '../types';

interface GiftInfoModalProps {
  content: WeddingContent['giftInfo'];
}

export function GiftInfoModal({ content }: GiftInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!content.showSection) return null;

  const handleCopy = (accountNumber: string, index: number) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2500);
  };

  return (
    <>
      {/* Discreet On-Page Gift Section */}
      <section
        id="gift-section"
        className="py-14 md:py-20 px-6 bg-[#FDFCF8] text-[#1B3022] text-center border-b border-[#1B3022]/5"
      >
        <div className="max-w-xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-white border border-[#1B3022]/10 flex items-center justify-center mx-auto mb-4 text-[#C5A059] shadow-xs">
            <Gift className="w-5 h-5" />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif-luxury text-2xl sm:text-3xl text-[#1B3022] mb-2"
          >
            {content.title}
          </motion.h2>

          <p className="text-xs text-[#1B3022]/70 max-w-md mx-auto mb-6">
            {content.subtitle}
          </p>

          <button
            id="view-gift-info-btn"
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-[#1B3022] text-[#1B3022] hover:bg-[#1B3022] hover:text-[#FDFCF8] transition-all text-xs font-semibold uppercase tracking-[0.18em] cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>{content.buttonText || 'VIEW GIFT INFORMATION'}</span>
          </button>
        </div>
      </section>

      {/* Discreet Reveal Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#122218]/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-[#FDFCF8] rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-[#1B3022]/10 shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close gift details"
                className="absolute top-4 right-4 p-2 rounded-full text-[#1B3022]/60 hover:text-[#1B3022] hover:bg-[#1B3022]/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-white border border-[#1B3022]/10 flex items-center justify-center mx-auto mb-3 text-[#C5A059] shadow-xs">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="font-serif-luxury text-2xl text-[#1B3022]">
                  Gift Information
                </h3>
                {content.narrationNote && (
                  <p className="text-xs text-[#1B3022]/70 mt-2 leading-relaxed max-w-sm mx-auto">
                    {content.narrationNote}
                  </p>
                )}
              </div>

              {/* Accounts List */}
              <div className="space-y-4 mb-6">
                {content.accounts.map((acc: BankAccount, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-[#1B3022]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B3022] text-[#FDFCF8]">
                          {acc.bankName}
                        </span>
                        <span className="text-xs font-semibold text-[#1B3022]">
                          {acc.accountName}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-base font-medium tracking-wider text-[#1B3022]">
                        {acc.accountNumber}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(acc.accountNumber, idx)}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#FDFCF8] border border-[#1B3022]/15 text-xs font-medium text-[#1B3022] hover:bg-[#1B3022] hover:text-[#FDFCF8] transition-colors cursor-pointer shrink-0"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 px-6 rounded-xl bg-[#1B3022] text-[#FDFCF8] text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A059] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
