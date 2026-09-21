import { useState, useEffect, useCallback } from 'react';
import type { WeddingContent } from './types';
import { DEFAULT_WEDDING_CONTENT } from './data/defaultContent';
import {
  getWeddingContent,
  subscribeToContentUpdates,
  checkAdminSession,
  adminSignOut,
} from './services/supabaseService';

// Subcomponents
import { HeroSection } from './components/HeroSection';
import { InvitationSection } from './components/InvitationSection';
import { WeddingDaySection } from './components/WeddingDaySection';
import { CountdownSection } from './components/CountdownSection';
import { MomentsGallery } from './components/MomentsGallery';
import { DressCodeSection } from './components/DressCodeSection';
import { RsvpSection } from './components/RsvpSection';
import { GiftInfoModal } from './components/GiftInfoModal';
import { ClosingSection } from './components/ClosingSection';
import { AdminCMS } from './components/AdminCMS';
import { AdminLoginPage } from './components/AdminLoginPage';

function isPathAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    hash.startsWith('#admin') ||
    hash.startsWith('#/admin')
  );
}

export default function App() {
  const [content, setContent] = useState<WeddingContent>(DEFAULT_WEDDING_CONTENT);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(isPathAdmin);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => checkAdminSession());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load content on mount
  useEffect(() => {
    async function loadData() {
      try {
        const loaded = await getWeddingContent();
        setContent(loaded);
      } catch (err) {
        console.error('Error fetching wedding content:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Check existing admin session
    setIsAdminLoggedIn(checkAdminSession());

    // Subscribe to live Postgres changes from Supabase wedding_content table
    const unsubscribe = subscribeToContentUpdates((updated) => {
      setContent(updated);
    });

    // Listen to browser navigation (Back / Forward / pushState / hashchange)
    const handleRouteCheck = () => {
      setIsAdminRoute(isPathAdmin());
    };
    window.addEventListener('popstate', handleRouteCheck);
    window.addEventListener('hashchange', handleRouteCheck);

    return () => {
      unsubscribe();
      window.removeEventListener('popstate', handleRouteCheck);
      window.removeEventListener('hashchange', handleRouteCheck);
    };
  }, []);

  const navigateToPublic = useCallback(() => {
    if (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.includes('admin')
    ) {
      window.history.pushState(null, '', '/');
    }
    setIsAdminRoute(false);
  }, []);

  const handleSignOut = async () => {
    await adminSignOut();
    setIsAdminLoggedIn(false);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full border border-[#C5A059]/40 flex items-center justify-center font-serif-luxury text-xl font-bold text-[#1B3022] mb-3 animate-pulse">
          F&amp;T
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          Loading Invitation...
        </p>
      </div>
    );
  }

  // ==========================================
  // ROUTE 1: /admin
  // ==========================================
  if (isAdminRoute) {
    // If not authenticated, unauthenticated visitors CANNOT access the dashboard
    if (!isAdminLoggedIn) {
      return (
        <AdminLoginPage
          onSuccess={() => setIsAdminLoggedIn(true)}
          onBackToPublic={navigateToPublic}
        />
      );
    }

    // Authenticated admin: render full existing CMS exactly as it is
    return (
      <AdminCMS
        content={content}
        onUpdateContent={(updated) => setContent(updated)}
        onPreviewWebsite={navigateToPublic}
        onSignOut={handleSignOut}
      />
    );
  }

  // ==========================================
  // ROUTE 2: / (Public Digital Wedding Invitation)
  // Completely pristine: no visible admin/CMS buttons or panels!
  // ==========================================
  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-[#1B3022] font-sans antialiased overflow-x-hidden selection:bg-[#1B3022] selection:text-[#FDFCF8]">
      {/* Discreet Floating Top Monogram Badge */}
      <header className="absolute top-0 inset-x-0 z-30 px-5 py-4 flex items-center justify-start pointer-events-none">
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={() => scrollToSection('hero-section')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122218]/50 backdrop-blur-xs border border-white/20 text-[#FDFCF8] hover:bg-[#122218]/75 transition-colors cursor-pointer"
          >
            <span className="font-serif-luxury font-bold text-sm tracking-wider text-[#C5A059]">
              F&amp;T
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#FDFCF8]/80 hidden sm:inline">
              24.10.2026
            </span>
          </button>
        </div>
      </header>

      {/* SECTION 1 — HERO */}
      <HeroSection
        content={content.hero}
        onExploreClick={() => scrollToSection('invitation-section')}
      />

      {/* SECTION 2 — THE INVITATION */}
      <InvitationSection content={content.invitation} />

      {/* SECTION 3 — THE DAY */}
      <WeddingDaySection content={content.weddingDay} />

      {/* SECTION 4 — COUNTDOWN */}
      <CountdownSection content={content.countdown} />

      {/* SECTION 5 — OUR MOMENTS */}
      <MomentsGallery content={content.moments} />

      {/* SECTION 6 — DRESS CODE */}
      <DressCodeSection content={content.dressCode} />

      {/* SECTION 7 — RSVP */}
      <RsvpSection content={content.rsvpSettings} />

      {/* SECTION 8 — GIFT INFORMATION */}
      <GiftInfoModal content={content.giftInfo} />

      {/* SECTION 9 — CLOSING */}
      <ClosingSection content={content.closing} />
    </div>
  );
}
