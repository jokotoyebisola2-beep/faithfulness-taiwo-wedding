import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Save,
  Eye,
  LogOut,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  CheckCircle2,
  Users,
  Plus,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Download,
  AlertCircle,
  Database,
  Loader2,
} from 'lucide-react';
import type { WeddingContent, WeddingPhoto, RsvpSubmission, BankAccount } from '../types';
import {
  saveWeddingContent,
  getRsvpList,
  deleteRsvp,
  resetToDefaultContent,
  getSupabaseStatus,
  saveSupabaseConfig,
  uploadWeddingImage,
  deleteWeddingImage,
  getSupabaseCredentials,
  getSupabaseClient,
} from '../services/supabaseService';

interface AdminCMSProps {
  content: WeddingContent;
  onUpdateContent: (newContent: WeddingContent) => void;
  onPreviewWebsite: () => void;
  onSignOut: () => void;
}

type TabType =
  | 'hero'
  | 'invitation'
  | 'details'
  | 'moments'
  | 'countdown'
  | 'dresscode'
  | 'rsvp'
  | 'gift'
  | 'closing'
  | 'firebase';

export function AdminCMS({
  content: initialContent,
  onUpdateContent,
  onPreviewWebsite,
  onSignOut,
}: AdminCMSProps) {
  const [form, setForm] = useState<WeddingContent>(initialContent);
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [rsvps, setRsvps] = useState<RsvpSubmission[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseCredentials().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseCredentials().anonKey);
  const [supabaseStatus, setSupabaseStatus] = useState(() => getSupabaseStatus());
  const [supabaseMessage, setSupabaseMessage] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const closingFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === 'rsvp') {
      loadRsvps();
    }
  }, [activeTab]);

  const loadRsvps = async () => {
    setLoadingRsvps(true);
    try {
      const list = await getRsvpList();
      setRsvps(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRsvps(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveWeddingContent(form);
      onUpdateContent(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`Could not save to Supabase: ${err?.message || err}. Please ensure Supabase connection is active and RLS policies allow saving.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset all wedding information and photos to initial defaults?'
      )
    ) {
      const reset = await resetToDefaultContent();
      setForm(reset);
      onUpdateContent(reset);
      alert('Reset to defaults complete.');
    }
  };

  // Gallery Management
  const addGalleryPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const newPhoto: WeddingPhoto = {
      id: 'photo_' + Date.now(),
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || undefined,
    };
    setForm({
      ...form,
      moments: {
        ...form.moments,
        images: [...form.moments.images, newPhoto],
      },
    });
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleUploadGalleryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const publicUrl = await uploadWeddingImage(file, 'gallery');
      const newPhoto: WeddingPhoto = {
        id: 'photo_' + Date.now(),
        url: publicUrl,
        caption: file.name.replace(/\.[^/.]+$/, ''),
      };
      setForm((prev) => ({
        ...prev,
        moments: {
          ...prev.moments,
          images: [...prev.moments.images, newPhoto],
        },
      }));
    } catch (err: any) {
      console.error('Supabase storage upload error:', err);
      alert(`Image upload to Supabase failed: ${err?.message || err}. Please ensure 'wedding-images' bucket is public and connected.`);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const deleteGalleryPhoto = (id: string) => {
    const photo = form.moments.images.find((img) => img.id === id);
    if (photo?.url) {
      deleteWeddingImage(photo.url).catch(() => {});
    }
    setForm({
      ...form,
      moments: {
        ...form.moments,
        images: form.moments.images.filter((img) => img.id !== id),
      },
    });
  };

  const handleHeroFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const publicUrl = await uploadWeddingImage(file, 'hero');
      setForm((prev) => ({
        ...prev,
        hero: { ...prev.hero, imageUrl: publicUrl },
      }));
    } catch (err: any) {
      console.error('Hero upload error:', err);
      alert(`Hero image upload to Supabase failed: ${err?.message || err}. Please ensure 'wedding-images' bucket is public and connected.`);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleClosingFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const publicUrl = await uploadWeddingImage(file, 'closing');
      setForm((prev) => ({
        ...prev,
        closing: { ...prev.closing, imageUrl: publicUrl },
      }));
    } catch (err: any) {
      console.error('Closing image upload error:', err);
      alert(`Closing image upload to Supabase failed: ${err?.message || err}. Please ensure 'wedding-images' bucket is public and connected.`);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const newImages = [...form.moments.images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setForm({
      ...form,
      moments: {
        ...form.moments,
        images: newImages,
      },
    });
  };

  const setPhotoAsHero = (url: string) => {
    setForm({
      ...form,
      hero: {
        ...form.hero,
        imageUrl: url,
      },
    });
    alert('Photo set as Hero image!');
  };

  const setPhotoAsClosing = (url: string) => {
    setForm({
      ...form,
      closing: {
        ...form.closing,
        imageUrl: url,
      },
    });
    alert('Photo set as Closing image!');
  };

  // Bank Accounts Management
  const addBankAccount = () => {
    setForm({
      ...form,
      giftInfo: {
        ...form.giftInfo,
        accounts: [
          ...form.giftInfo.accounts,
          { bankName: 'Bank Name', accountName: '', accountNumber: '' },
        ],
      },
    });
  };

  const removeBankAccount = (index: number) => {
    setForm({
      ...form,
      giftInfo: {
        ...form.giftInfo,
        accounts: form.giftInfo.accounts.filter((_, i) => i !== index),
      },
    });
  };

  const updateBankAccount = (
    index: number,
    field: keyof BankAccount,
    value: string
  ) => {
    const updated = [...form.giftInfo.accounts];
    updated[index] = { ...updated[index], [field]: value };
    setForm({
      ...form,
      giftInfo: {
        ...form.giftInfo,
        accounts: updated,
      },
    });
  };

  // RSVP Submissions
  const handleDeleteRsvp = async (id: string) => {
    if (window.confirm('Delete this RSVP submission?')) {
      await deleteRsvp(id);
      setRsvps(rsvps.filter((r) => r.id !== id));
    }
  };

  const exportRsvpsCsv = () => {
    if (rsvps.length === 0) return;
    const headers = ['Name', 'Attendance', 'Guest Count', 'Phone', 'Message', 'Submitted At'];
    const rows = rsvps.map((r) => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.attendance,
      r.guestCount,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      r.submittedAt,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Faithfulness_Taiwo_Wedding_RSVPs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAttending = rsvps.filter((r) => r.attendance === 'yes');
  const totalDeclined = rsvps.filter((r) => r.attendance === 'no');
  const totalGuestHeadcount = totalAttending.reduce((sum, r) => sum + (r.guestCount || 1), 0);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1B3022] flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#122218] text-[#FDFCF8] border-b border-white/10 sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-[#C5A059]/40 flex items-center justify-center font-serif-luxury text-sm font-bold text-[#C5A059]">
            F&amp;T
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-[#FDFCF8]">
              Wedding Invitation CMS
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#C5A059]">
              Faithfulness &amp; Taiwo &bull; 24 Oct 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {saveSuccess && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-300 font-medium animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved Live!
            </span>
          )}

          <button
            id="admin-preview-btn"
            type="button"
            onClick={onPreviewWebsite}
            title="Return to the public wedding invitation"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-[#FDFCF8] text-xs font-medium tracking-wide transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>View Public Site</span>
          </button>

          <button
            id="admin-save-btn"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-[#C5A059] text-[#122218] text-xs font-semibold tracking-wide hover:bg-[#d6b473] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            title="Sign Out"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-[#F4EFEA] border-b border-[#1B3022]/10 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="flex space-x-1 sm:space-x-2 py-2 max-w-6xl mx-auto">
          {[
            { id: 'hero', label: '1. Couple & Hero' },
            { id: 'invitation', label: '2. Invitation' },
            { id: 'details', label: '3. Wedding Day' },
            { id: 'moments', label: '4. Our Moments' },
            { id: 'countdown', label: '5. Countdown' },
            { id: 'dresscode', label: '6. Dress Code' },
            { id: 'rsvp', label: '7. RSVP' },
            { id: 'gift', label: '8. Gift Information' },
            { id: 'closing', label: '9. Closing' },
            { id: 'firebase', label: '10. Cloud & Supabase' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 px-3 sm:px-4 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1B3022] text-[#FDFCF8] shadow-xs'
                  : 'text-[#1B3022]/70 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Form Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* 1. HERO */}
        {activeTab === 'hero' && (
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
            <div className="border-b border-[#EAE3D6] pb-4">
              <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                Couple &amp; Hero Section
              </h2>
              <p className="text-xs text-[#55695D]">
                Manage couple display names, wedding date display, and the dominant hero photograph.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Couple Display Names
                </label>
                <input
                  type="text"
                  value={form.hero.coupleNames}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, coupleNames: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Tagline
                </label>
                <input
                  type="text"
                  value={form.hero.tagline}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, tagline: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Date Display
                </label>
                <input
                  type="text"
                  value={form.hero.dateDisplay}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, dateDisplay: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Scroll Indicator Text
                </label>
                <input
                  type="text"
                  value={form.hero.scrollIndicatorText}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: {
                        ...form.hero,
                        scrollIndicatorText: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>
            </div>

            {/* Hero Image */}
            <div className="pt-4 border-t border-[#EAE3D6]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                Hero Image URL
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={form.hero.imageUrl}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, imageUrl: e.target.value },
                    })
                  }
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
                <input
                  ref={heroFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeroFileSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => heroFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#162E20] text-[#FAF8F5] text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#D8BE8A] animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#D8BE8A]" />
                  )}
                  <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                </button>
              </div>

              {/* Preview */}
              {form.hero.imageUrl && (
                <div className="relative w-full max-w-sm aspect-16/10 rounded-xl overflow-hidden border border-[#D5CABB] bg-neutral-100">
                  <img
                    src={form.hero.imageUrl}
                    alt="Hero Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-[center_28%]"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-[10px]">
                    Hero Image Active
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. INVITATION */}
        {activeTab === 'invitation' && (
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-4">
              <div>
                <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                  The Invitation Section
                </h2>
                <p className="text-xs text-[#55695D]">
                  Families cordial invitation text and Bible verse.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold uppercase text-[#162E20]">
                  {form.invitation.showSection ? 'Visible' : 'Hidden'}
                </span>
                <input
                  type="checkbox"
                  checked={form.invitation.showSection}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invitation: {
                        ...form.invitation,
                        showSection: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#162E20] rounded"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Families Announcement
                </label>
                <input
                  type="text"
                  value={form.invitation.families}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invitation: {
                        ...form.invitation,
                        families: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Invitation Lead Line
                </label>
                <textarea
                  rows={2}
                  value={form.invitation.invitationLead}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invitation: {
                        ...form.invitation,
                        invitationLead: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Couple Names
                </label>
                <input
                  type="text"
                  value={form.invitation.coupleNames}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invitation: {
                        ...form.invitation,
                        coupleNames: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                    Bible Verse Text
                  </label>
                  <textarea
                    rows={2}
                    value={form.invitation.bibleVerse}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        invitation: {
                          ...form.invitation,
                          bibleVerse: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                    Scripture Reference
                  </label>
                  <input
                    type="text"
                    value={form.invitation.verseReference}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        invitation: {
                          ...form.invitation,
                          verseReference: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. WEDDING DETAILS */}
        {activeTab === 'details' && (
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-8">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-4">
              <div>
                <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                  The Wedding Day (Ceremony &amp; Reception)
                </h2>
                <p className="text-xs text-[#55695D]">
                  Edit venue names, dates, times, addresses, and Google Maps direction links.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold uppercase text-[#162E20]">
                  {form.weddingDay.showSection ? 'Visible' : 'Hidden'}
                </span>
                <input
                  type="checkbox"
                  checked={form.weddingDay.showSection}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      weddingDay: {
                        ...form.weddingDay,
                        showSection: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#162E20] rounded"
                />
              </label>
            </div>

            {/* Ceremony Form */}
            <div className="p-5 rounded-xl bg-[#F4EFEA] border border-[#E8E0D5] space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[#162E20]">
                Ceremony Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={form.weddingDay.ceremony.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          ceremony: {
                            ...form.weddingDay.ceremony,
                            date: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={form.weddingDay.ceremony.time}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          ceremony: {
                            ...form.weddingDay.ceremony,
                            time: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={form.weddingDay.ceremony.venue}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          ceremony: {
                            ...form.weddingDay.ceremony,
                            venue: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={form.weddingDay.ceremony.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          ceremony: {
                            ...form.weddingDay.ceremony,
                            address: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    value={form.weddingDay.ceremony.mapUrl}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          ceremony: {
                            ...form.weddingDay.ceremony,
                            mapUrl: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Reception Form */}
            <div className="p-5 rounded-xl bg-[#F4EFEA] border border-[#E8E0D5] space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[#162E20]">
                Reception Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={form.weddingDay.reception.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          reception: {
                            ...form.weddingDay.reception,
                            date: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={form.weddingDay.reception.time}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          reception: {
                            ...form.weddingDay.reception,
                            time: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={form.weddingDay.reception.venue}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          reception: {
                            ...form.weddingDay.reception,
                            venue: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={form.weddingDay.reception.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          reception: {
                            ...form.weddingDay.reception,
                            address: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#162E20] mb-1">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    value={form.weddingDay.reception.mapUrl}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weddingDay: {
                          ...form.weddingDay,
                          reception: {
                            ...form.weddingDay.reception,
                            mapUrl: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. OUR MOMENTS GALLERY */}
        {activeTab === 'moments' && (
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-4">
              <div>
                <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                  Our Moments Gallery
                </h2>
                <p className="text-xs text-[#55695D]">
                  Upload, replace, reorder, delete, or designate photographs as Hero or Closing.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold uppercase text-[#162E20]">
                  {form.moments.showSection ? 'Visible' : 'Hidden'}
                </span>
                <input
                  type="checkbox"
                  checked={form.moments.showSection}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      moments: {
                        ...form.moments,
                        showSection: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#162E20] rounded"
                />
              </label>
            </div>

            {/* Add New Photo Box */}
            <div className="p-4 rounded-xl bg-[#F4EFEA] border border-[#E8E0D5] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#162E20]">
                Add Photo to Gallery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Paste Image URL (https://...)"
                  className="sm:col-span-2 px-3 py-2 rounded-lg border border-[#D5CABB] bg-white text-xs"
                />
                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder="Optional caption"
                  className="px-3 py-2 rounded-lg border border-[#D5CABB] bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={addGalleryPhoto}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-[#162E20] text-[#FAF8F5] text-xs font-medium cursor-pointer hover:bg-[#244633]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D8BE8A]" />
                  <span>Add URL</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadGalleryPhoto}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-white border border-[#D5CABB] text-[#162E20] text-xs font-medium cursor-pointer hover:bg-neutral-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File From Device</span>
                </button>
              </div>
            </div>

            {/* Photos List */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#162E20]">
                Current Gallery Photos ({form.moments.images.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.moments.images.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="p-3.5 rounded-xl bg-white border border-[#E0D7C6] flex gap-3.5 shadow-xs"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-neutral-100 border border-[#EAE3D6]">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Moment'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <input
                          type="text"
                          value={photo.caption || ''}
                          onChange={(e) => {
                            const updated = [...form.moments.images];
                            updated[index] = {
                              ...updated[index],
                              caption: e.target.value,
                            };
                            setForm({
                              ...form,
                              moments: { ...form.moments, images: updated },
                            });
                          }}
                          placeholder="Add caption..."
                          className="w-full text-xs font-medium text-[#162E20] border-b border-transparent focus:border-[#162E20] focus:outline-none pb-1"
                        />
                        <p className="text-[10px] text-[#88998C] truncate mt-1">
                          {photo.url}
                        </p>
                      </div>

                      <div className="flex items-center flex-wrap gap-1.5 pt-2">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => movePhoto(index, 'up')}
                          disabled={index === 0}
                          title="Move up"
                          className="p-1.5 rounded bg-[#F4EFEA] hover:bg-[#EAE3D6] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3 text-[#162E20]" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => movePhoto(index, 'down')}
                          disabled={index === form.moments.images.length - 1}
                          title="Move down"
                          className="p-1.5 rounded bg-[#F4EFEA] hover:bg-[#EAE3D6] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3 text-[#162E20]" />
                        </button>

                        {/* Set as Hero */}
                        <button
                          type="button"
                          onClick={() => setPhotoAsHero(photo.url)}
                          className="text-[10px] uppercase font-semibold px-2 py-1 rounded bg-[#F4EFEA] text-[#162E20] hover:bg-[#162E20] hover:text-white cursor-pointer"
                        >
                          Set as Hero
                        </button>

                        {/* Set as Closing */}
                        <button
                          type="button"
                          onClick={() => setPhotoAsClosing(photo.url)}
                          className="text-[10px] uppercase font-semibold px-2 py-1 rounded bg-[#F4EFEA] text-[#162E20] hover:bg-[#162E20] hover:text-white cursor-pointer"
                        >
                          Set as Closing
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteGalleryPhoto(photo.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 ml-auto cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. COUNTDOWN */}
        {activeTab === 'countdown' && (
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-4">
              <div>
                <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                  Countdown Timer
                </h2>
                <p className="text-xs text-[#55695D]">
                  Set the target wedding date/time and the celebratory message shown after the day.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold uppercase text-[#162E20]">
                  {form.countdown.showSection ? 'Visible' : 'Hidden'}
                </span>
                <input
                  type="checkbox"
                  checked={form.countdown.showSection}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      countdown: {
                        ...form.countdown,
                        showSection: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#162E20] rounded"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Target Wedding Date &amp; Time (ISO format)
                </label>
                <input
                  type="datetime-local"
                  value={form.countdown.targetDate.slice(0, 16)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      countdown: {
                        ...form.countdown,
                        targetDate: e.target.value + ':00',
                      },
                    })
                  }
                  className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
                <p className="text-[11px] text-[#788A7F] mt-1">
                  Wedding date set for 24 October 2026, 11:00 AM
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Post-Wedding Passed Message
                </label>
                <input
                  type="text"
                  value={form.countdown.passedMessage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      countdown: {
                        ...form.countdown,
                        passedMessage: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. DRESS CODE */}
        {activeTab === 'dresscode' && (
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-4">
              <div>
                <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                  Dress Code Section
                </h2>
                <p className="text-xs text-[#55695D]">
                  Attire colors and notes for attending guests.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold uppercase text-[#162E20]">
                  {form.dressCode.showSection ? 'Visible' : 'Hidden'}
                </span>
                <input
                  type="checkbox"
                  checked={form.dressCode.showSection}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dressCode: {
                        ...form.dressCode,
                        showSection: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#162E20] rounded"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Section Title
                </label>
                <input
                  type="text"
                  value={form.dressCode.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dressCode: {
                        ...form.dressCode,
                        title: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Colors Text
                </label>
                <input
                  type="text"
                  value={form.dressCode.colors}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dressCode: {
                        ...form.dressCode,
                        colors: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                    Primary Swatch (Purple)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.dressCode.primaryHex}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dressCode: {
                            ...form.dressCode,
                            primaryHex: e.target.value,
                          },
                        })
                      }
                      className="w-10 h-10 rounded border border-[#D5CABB] p-0.5 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{form.dressCode.primaryHex}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                    Secondary Swatch (Sea Green)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.dressCode.secondaryHex}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dressCode: {
                            ...form.dressCode,
                            secondaryHex: e.target.value,
                          },
                        })
                      }
                      className="w-10 h-10 rounded border border-[#D5CABB] p-0.5 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{form.dressCode.secondaryHex}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Description / Guest Guidance
                </label>
                <textarea
                  rows={2}
                  value={form.dressCode.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dressCode: {
                        ...form.dressCode,
                        description: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. RSVP */}
        {activeTab === 'rsvp' && (
          <div className="space-y-6">
            {/* Settings Card */}
            <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-4">
                <div>
                  <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                    RSVP Configuration
                  </h2>
                  <p className="text-xs text-[#55695D]">
                    Configure RSVP acceptance status, response deadline, and contact info.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold uppercase text-[#162E20]">
                      Accepting RSVPs: {form.rsvpSettings.isEnabled ? 'ON' : 'OFF'}
                    </span>
                    <input
                      type="checkbox"
                      checked={form.rsvpSettings.isEnabled}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          rsvpSettings: {
                            ...form.rsvpSettings,
                            isEnabled: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-[#162E20] rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={form.rsvpSettings.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rsvpSettings: {
                          ...form.rsvpSettings,
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                    Inquiry Phone Contact
                  </label>
                  <input
                    type="text"
                    value={form.rsvpSettings.phoneContact}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rsvpSettings: {
                          ...form.rsvpSettings,
                          phoneContact: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                    Deadline Note
                  </label>
                  <input
                    type="text"
                    value={form.rsvpSettings.deadlineText}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rsvpSettings: {
                          ...form.rsvpSettings,
                          deadlineText: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submissions Overview & Table */}
            <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-4">
                <div>
                  <h3 className="font-serif-luxury text-xl text-[#162E20]">
                    Submitted Guest Responses
                  </h3>
                  <p className="text-xs text-[#55695D]">
                    Real-time RSVPs received from website visitors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadRsvps}
                    className="p-2 rounded-lg border border-[#D5CABB] bg-white text-xs hover:bg-neutral-50 cursor-pointer"
                    title="Refresh list"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={exportRsvpsCsv}
                    disabled={rsvps.length === 0}
                    className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-[#162E20] text-[#FAF8F5] text-xs font-medium cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D8BE8A]" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#F4EFEA] border border-[#E8E0D5] text-center">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#55695D]">
                    Attending RSVPs
                  </span>
                  <p className="font-serif-luxury text-2xl font-bold text-[#162E20] mt-0.5">
                    {totalAttending.length}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F4EFEA] border border-[#E8E0D5] text-center">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#55695D]">
                    Total Guest Headcount
                  </span>
                  <p className="font-serif-luxury text-2xl font-bold text-[#8F7242] mt-0.5">
                    {totalGuestHeadcount}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F4EFEA] border border-[#E8E0D5] text-center">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#55695D]">
                    Regrets / Unable
                  </span>
                  <p className="font-serif-luxury text-2xl font-bold text-[#8F4242] mt-0.5">
                    {totalDeclined.length}
                  </p>
                </div>
              </div>

              {/* Submissions List */}
              {loadingRsvps ? (
                <div className="text-center py-8 text-xs text-[#55695D]">
                  Loading guest responses...
                </div>
              ) : rsvps.length === 0 ? (
                <div className="text-center py-10 bg-[#F4EFEA] rounded-xl border border-[#E8E0D5]">
                  <Users className="w-8 h-8 text-[#A0988A] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#162E20]">
                    No RSVP submissions yet.
                  </p>
                  <p className="text-xs text-[#55695D] mt-1">
                    When guests RSVP through the website, their responses will appear right here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E0D7C6] text-[#697A6F] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Guest Name</th>
                        <th className="py-2.5 px-3">Attendance</th>
                        <th className="py-2.5 px-3">Party Size</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Message</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE3D6]">
                      {rsvps.map((rsvp) => (
                        <tr key={rsvp.id} className="hover:bg-white/60">
                          <td className="py-3 px-3 font-semibold text-[#162E20]">
                            {rsvp.name}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                rsvp.attendance === 'yes'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-200 text-neutral-700'
                              }`}
                            >
                              {rsvp.attendance === 'yes' ? 'Attending' : 'Declined'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium">
                            {rsvp.attendance === 'yes' ? `${rsvp.guestCount} guest(s)` : '-'}
                          </td>
                          <td className="py-3 px-3 text-[#4D5E53]">
                            {rsvp.phone || '-'}
                          </td>
                          <td className="py-3 px-3 text-[#4D5E53] max-w-xs truncate" title={rsvp.message}>
                            {rsvp.message || '-'}
                          </td>
                          <td className="py-3 px-3 text-[#7B8D82] whitespace-nowrap">
                            {new Date(rsvp.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteRsvp(rsvp.id)}
                              className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                              title="Delete RSVP"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. GIFT INFORMATION */}
        {activeTab === 'gift' && (
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-4">
              <div>
                <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                  Gift Information
                </h2>
                <p className="text-xs text-[#55695D]">
                  Configure discreet gift modal, bank accounts, and payment narration guidance.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold uppercase text-[#162E20]">
                  {form.giftInfo.showSection ? 'Visible' : 'Hidden'}
                </span>
                <input
                  type="checkbox"
                  checked={form.giftInfo.showSection}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      giftInfo: {
                        ...form.giftInfo,
                        showSection: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#162E20] rounded"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Main Section Heading
                </label>
                <input
                  type="text"
                  value={form.giftInfo.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      giftInfo: { ...form.giftInfo, title: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Subtext Prompt
                </label>
                <input
                  type="text"
                  value={form.giftInfo.subtitle}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      giftInfo: { ...form.giftInfo, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Button Text
                </label>
                <input
                  type="text"
                  value={form.giftInfo.buttonText}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      giftInfo: {
                        ...form.giftInfo,
                        buttonText: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Narration / Cash Gift Instructions
                </label>
                <textarea
                  rows={2}
                  value={form.giftInfo.narrationNote}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      giftInfo: {
                        ...form.giftInfo,
                        narrationNote: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              {/* Bank Accounts */}
              <div className="pt-4 border-t border-[#EAE3D6] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#162E20]">
                    Bank Account Details ({form.giftInfo.accounts.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addBankAccount}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#162E20] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#8F7242]" />
                    <span>Add Another Account</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {form.giftInfo.accounts.map((acc, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-[#F4EFEA] border border-[#E8E0D5] grid grid-cols-1 sm:grid-cols-3 gap-3 relative"
                    >
                      <div>
                        <label className="block text-[11px] font-medium text-[#162E20] mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={acc.bankName}
                          onChange={(e) =>
                            updateBankAccount(index, 'bankName', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CABB] bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#162E20] mb-1">
                          Account Name
                        </label>
                        <input
                          type="text"
                          value={acc.accountName}
                          onChange={(e) =>
                            updateBankAccount(
                              index,
                              'accountName',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CABB] bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#162E20] mb-1">
                          Account Number
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={acc.accountNumber}
                            onChange={(e) =>
                              updateBankAccount(
                                index,
                                'accountNumber',
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2 rounded-lg border border-[#D5CABB] bg-white text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => removeBankAccount(index)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Remove account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. CLOSING */}
        {activeTab === 'closing' && (
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-4">
              <div>
                <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                  Closing Section
                </h2>
                <p className="text-xs text-[#55695D]">
                  Final couple portrait and warm heartfelt closing sign-off.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold uppercase text-[#162E20]">
                  {form.closing.showSection ? 'Visible' : 'Hidden'}
                </span>
                <input
                  type="checkbox"
                  checked={form.closing.showSection}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      closing: {
                        ...form.closing,
                        showSection: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#162E20] rounded"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Closing Message
                </label>
                <input
                  type="text"
                  value={form.closing.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      closing: { ...form.closing, message: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Signature Line
                </label>
                <input
                  type="text"
                  value={form.closing.coupleSign}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      closing: { ...form.closing, coupleSign: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Final Photograph URL
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={form.closing.imageUrl}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        closing: { ...form.closing, imageUrl: e.target.value },
                      })
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-sm"
                  />
                  <input
                    ref={closingFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleClosingFileSelected}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => closingFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#162E20] text-[#FAF8F5] text-xs font-medium cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#D8BE8A] animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#D8BE8A]" />
                    )}
                    <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                </div>

                {form.closing.imageUrl && (
                  <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-[#C5A265] bg-neutral-100">
                    <img
                      src={form.closing.imageUrl}
                      alt="Closing Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 10. SETTINGS & CLOUD (SUPABASE) */}
        {activeTab === 'firebase' && (
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#E0D7C6] shadow-xs space-y-6">
            <div className="border-b border-[#EAE3D6] pb-4">
              <h2 className="font-serif-luxury text-2xl text-[#162E20]">
                Supabase Database &amp; Storage Settings
              </h2>
              <p className="text-xs text-[#55695D]">
                Live cloud synchronization for wedding settings, gallery photos, and guest RSVPs.
              </p>
            </div>

            {/* Status card */}
            <div className="p-4 rounded-xl bg-[#F4EFEA] border border-[#E8E0D5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    supabaseStatus.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#162E20]">
                    {supabaseStatus.isConfigured
                      ? 'Connected to Supabase Project'
                      : 'Local High-Speed Cache Active'}
                  </h4>
                  <p className="text-[11px] text-[#55695D]">
                    {supabaseStatus.isConfigured
                      ? `Project URL: ${supabaseStatus.url} — Content and guest RSVPs synchronize live to Supabase.`
                      : 'Changes are currently saved to local storage. Connect your live Supabase project below to enable real-time cloud persistence.'}
                  </p>
                </div>
              </div>
              <Database className="w-5 h-5 text-[#8F7242]" />
            </div>

            {/* Supabase Connection Form */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-xs font-mono text-[#162E20]"
                />
                <p className="text-[11px] text-[#55695D] mt-1">
                  Found in your Supabase project dashboard under Project Settings &gt; API.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#162E20] mb-1.5">
                  Supabase Anon / Publishable API Key
                </label>
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5CABB] bg-white text-xs font-mono text-[#162E20]"
                />
                <p className="text-[11px] text-[#55695D] mt-1">
                  Safe for client-side use with Row Level Security (RLS) enabled.
                </p>
              </div>

              {supabaseMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    supabaseMessage.includes('Success') || supabaseMessage.includes('connected')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {supabaseMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
                      setSupabaseMessage('Please enter both your Supabase URL and Anon Key.');
                      return;
                    }
                    const ok = saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                    if (ok) {
                      setSupabaseStatus(getSupabaseStatus());
                      setSupabaseMessage('Supabase project configuration saved and connected successfully!');
                    } else {
                      setSupabaseMessage('Could not initialize Supabase with the provided credentials. Please verify.');
                    }
                  }}
                  className="py-2.5 px-5 rounded-xl bg-[#162E20] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider hover:bg-[#244633] transition-colors cursor-pointer"
                >
                  Connect Supabase
                </button>

                <button
                  type="button"
                  disabled={isTestingConnection}
                  onClick={async () => {
                    setIsTestingConnection(true);
                    setSupabaseMessage(null);
                    try {
                      const client = getSupabaseClient();
                      if (!client) {
                        setSupabaseMessage('Supabase client is not configured. Enter credentials above.');
                        return;
                      }
                      const { data, error } = await client.from('wedding_content').select('id, updated_at').eq('id', 'main').maybeSingle();
                      if (error) {
                        setSupabaseMessage(`Connection test error: ${error.message}. Please check if the 'wedding_content' table is created.`);
                      } else if (data) {
                        setSupabaseMessage(`Success! Connected to Supabase. Found 'wedding_content' table (main record updated: ${data.updated_at || 'Recently'}).`);
                      } else {
                        setSupabaseMessage(`Success! Connected to Supabase 'wedding_content' table. Table is currently ready for its first save.`);
                      }
                    } catch (err: any) {
                      setSupabaseMessage(`Test failed: ${err?.message || 'Network error'}`);
                    } finally {
                      setIsTestingConnection(false);
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl border border-[#162E20]/20 bg-white text-[#162E20] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isTestingConnection ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
                  ) : (
                    <Database className="w-3.5 h-3.5 text-[#C5A059]" />
                  )}
                  <span>Test Connection</span>
                </button>
              </div>
            </div>

            {/* SQL Schema helper */}
            <div className="p-4 rounded-xl bg-white border border-[#EAE3D6] space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#162E20] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                Primary Supabase Storage Architecture
              </h4>
              <p className="text-xs text-[#55695D] leading-relaxed">
                The CMS persists directly to Supabase as its primary live backend:
              </p>
              <ul className="text-xs text-[#55695D] list-disc list-inside space-y-1">
                <li><code className="font-mono text-[#162E20]">wedding_content</code> — Stores full CMS content under row ID <code className="font-mono font-bold">main</code> with columns <code className="font-mono">id (text)</code>, <code className="font-mono">content (jsonb)</code>, and <code className="font-mono">updated_at (timestamptz)</code>.</li>
                <li><code className="font-mono text-[#162E20]">wedding-images</code> — Public Supabase Storage bucket for photo uploads (Hero, Gallery, Closing).</li>
                <li><code className="font-mono text-[#162E20]">rsvps</code> — Guest RSVP responses with automatic email dispatch to <code className="font-mono">gotaiwo12@gmail.com</code>.</li>
              </ul>
            </div>

            {/* Reset Defaults */}
            <div className="pt-6 border-t border-[#EAE3D6] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#162E20]">
                  Reset to Initial Defaults
                </h4>
                <p className="text-[11px] text-[#7A8C80]">
                  Restore the original wedding details, venue text, and couple photographs.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="py-2 px-3 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-medium cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
