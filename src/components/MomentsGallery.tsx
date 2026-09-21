import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { WeddingContent, WeddingPhoto } from '../types';

interface MomentsGalleryProps {
  content: WeddingContent['moments'];
}

export function MomentsGallery({ content }: MomentsGalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (!content.showSection || !content.images || content.images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % content.images.length);
    }
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(
        (selectedPhotoIndex - 1 + content.images.length) % content.images.length
      );
    }
  };

  return (
    <section
      id="moments-gallery-section"
      className="py-16 md:py-24 px-6 bg-[#FDFCF8] text-[#1B3022] border-b border-[#1B3022]/5"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059] mb-2"
          >
            Memories
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
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs text-[#1B3022]/60 max-w-md mx-auto"
            >
              {content.subtitle}
            </motion.p>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {content.images.map((photo: WeddingPhoto, index: number) => (
            <motion.div
              key={photo.id || index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-4/5 rounded-2xl overflow-hidden bg-white border border-[#1B3022]/10 shadow-xs cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <img
                src={photo.url}
                alt={photo.alt || photo.caption || `Moment ${index + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center grayscale-[12%] group-hover:grayscale-0 group-hover:scale-104 transition-all duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#122218]/0 group-hover:bg-[#122218]/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2.5 text-[#1B3022] shadow-xs">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#122218]/80 to-transparent text-[#FDFCF8] text-xs font-medium">
                  {photo.caption}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#122218]/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close photo preview"
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            {content.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {content.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image display */}
            <div
              className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={content.images[selectedPhotoIndex].url}
                alt={content.images[selectedPhotoIndex].caption || 'Wedding Photo'}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
              {content.images[selectedPhotoIndex].caption && (
                <p className="mt-3 text-sm text-[#FDFCF8]/90 tracking-wide font-light">
                  {content.images[selectedPhotoIndex].caption}
                </p>
              )}
              <span className="text-xs text-[#FDFCF8]/60 mt-1">
                {selectedPhotoIndex + 1} / {content.images.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
