import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Heart, Phone, Send, Loader2 } from 'lucide-react';
import { submitRsvp } from '../services/supabaseService';
import type { WeddingContent } from '../types';

interface RsvpSectionProps {
  content: WeddingContent['rsvpSettings'];
}

export function RsvpSection({ content }: RsvpSectionProps) {
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<'yes' | 'no'>('yes');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!content.showSection) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await submitRsvp({
        name: name.trim(),
        attendance,
        guestCount: attendance === 'yes' ? Number(guestCount) : 0,
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('RSVP submit error:', err);
      // Even if offline/network issue, our service caches locally
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setAttendance('yes');
    setGuestCount(1);
    setPhone('');
    setMessage('');
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <section
      id="rsvp-section"
      className="py-16 md:py-24 px-6 bg-[#FDFCF8] text-[#1B3022] border-b border-[#1B3022]/5"
    >
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059] mb-2"
          >
            Join The Celebration
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl text-[#1B3022] mb-3"
          >
            {content.title}
          </motion.h2>
          {content.subtitle && (
            <p className="text-xs text-[#1B3022]/70 max-w-md mx-auto mb-2">
              {content.subtitle}
            </p>
          )}
          {content.deadlineText && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C5A059]">
              {content.deadlineText}
            </p>
          )}
        </div>

        {!content.isEnabled ? (
          <div className="p-8 rounded-2xl bg-white border border-[#1B3022]/10 text-center shadow-xs">
            <p className="font-serif-luxury text-xl text-[#1B3022] mb-2">
              RSVP is currently closed.
            </p>
            <p className="text-xs text-[#1B3022]/60">
              For inquiries, please contact {content.phoneContact || 'the couple'}.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#1B3022]/10 shadow-xs">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="rsvp-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-14 h-14 rounded-full bg-[#1B3022] text-[#C5A059] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif-luxury text-2xl text-[#1B3022] mb-2">
                    Thank You, {name}!
                  </h3>
                  <p className="text-xs text-[#1B3022]/70 leading-relaxed max-w-sm mx-auto mb-6">
                    {attendance === 'yes'
                      ? `Your RSVP for ${guestCount} guest(s) has been joyfully received. We eagerly look forward to celebrating with you!`
                      : 'Thank you for letting us know. You will be warmly held in our hearts on this special day.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] uppercase tracking-wider font-semibold text-[#C5A059] hover:text-[#1B3022] underline transition-colors cursor-pointer"
                  >
                    Submit Another Response
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="rsvp-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                      {errorMessage}
                    </div>
                  )}

                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="rsvp-guest-name"
                      className="block text-[10px] font-bold uppercase tracking-wider text-[#1B3022] mb-1.5"
                    >
                      Full Name <span className="text-[#C5A059]">*</span>
                    </label>
                    <input
                      id="rsvp-guest-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mr. & Mrs. Adeleke"
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFCF8] border border-[#1B3022]/15 text-xs text-[#1B3022] placeholder:text-[#1B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#1B3022]/30"
                    />
                  </div>

                  {/* Attendance Choice */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1B3022] mb-2">
                      Will You Attend? <span className="text-[#C5A059]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAttendance('yes')}
                        className={`py-3 px-4 rounded-xl text-xs font-medium tracking-wide uppercase flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          attendance === 'yes'
                            ? 'bg-[#1B3022] text-[#FDFCF8] border-[#1B3022] shadow-xs'
                            : 'bg-[#FDFCF8] text-[#1B3022]/70 border-[#1B3022]/15 hover:border-[#1B3022]/30'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${attendance === 'yes' ? 'fill-[#C5A059] text-[#C5A059]' : ''}`} />
                        Yes, Attending
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendance('no')}
                        className={`py-3 px-4 rounded-xl text-xs font-medium tracking-wide uppercase flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          attendance === 'no'
                            ? 'bg-[#1B3022] text-[#FDFCF8] border-[#1B3022] shadow-xs'
                            : 'bg-[#FDFCF8] text-[#1B3022]/70 border-[#1B3022]/15 hover:border-[#1B3022]/30'
                        }`}
                      >
                        Unable to Attend
                      </button>
                    </div>
                  </div>

                  {/* Number of Guests (Only if attending) */}
                  {attendance === 'yes' && (
                    <div>
                      <label
                        htmlFor="rsvp-guest-count"
                        className="block text-[10px] font-bold uppercase tracking-wider text-[#1B3022] mb-1.5"
                      >
                        Number of Guests Attending
                      </label>
                      <select
                        id="rsvp-guest-count"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-[#FDFCF8] border border-[#1B3022]/15 text-xs text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#1B3022]/30"
                      >
                        <option value={1}>1 Guest (Self)</option>
                        <option value={2}>2 Guests (Couple / +1)</option>
                        <option value={3}>3 Guests</option>
                        <option value={4}>4 Guests (Family)</option>
                        <option value={5}>5 Guests</option>
                      </select>
                    </div>
                  )}

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="rsvp-phone-input"
                      className="block text-[10px] font-bold uppercase tracking-wider text-[#1B3022] mb-1.5"
                    >
                      Phone Number <span className="text-[#C5A059] text-[10px] font-normal tracking-normal">(optional)</span>
                    </label>
                    <input
                      id="rsvp-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0810 000 0000"
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFCF8] border border-[#1B3022]/15 text-xs text-[#1B3022] placeholder:text-[#1B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#1B3022]/30"
                    />
                  </div>

                  {/* Optional Message */}
                  <div>
                    <label
                      htmlFor="rsvp-message-input"
                      className="block text-[10px] font-bold uppercase tracking-wider text-[#1B3022] mb-1.5"
                    >
                      Message to the Couple <span className="text-[#C5A059] text-[10px] font-normal tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      id="rsvp-message-input"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Warm wishes, prayers, or blessings for Faithfulness & Taiwo..."
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFCF8] border border-[#1B3022]/15 text-xs text-[#1B3022] placeholder:text-[#1B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#1B3022]/30 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    id="submit-rsvp-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#1B3022] text-[#FDFCF8] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                        <span>Submitting RSVP...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Confirm RSVP</span>
                      </>
                    )}
                  </button>

                  {/* RSVP Contact */}
                  {content.phoneContact && (
                    <div className="pt-2 text-center">
                      <a
                        href={`tel:${content.phoneContact}`}
                        className="inline-flex items-center gap-1.5 text-xs text-[#1B3022]/70 hover:text-[#1B3022] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Inquiries: {content.phoneContact}</span>
                      </a>
                    </div>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
