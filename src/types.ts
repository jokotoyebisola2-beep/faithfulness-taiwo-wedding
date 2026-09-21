export interface WeddingPhoto {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
  isHero?: boolean;
  isClosing?: boolean;
}

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface WeddingContent {
  hero: {
    coupleNames: string;
    tagline: string;
    dateDisplay: string;
    imageUrl: string;
    scrollIndicatorText: string;
  };
  invitation: {
    families: string;
    invitationLead: string;
    coupleNames: string;
    bibleVerse: string;
    verseReference: string;
    showSection: boolean;
  };
  weddingDay: {
    showSection: boolean;
    ceremony: {
      title: string;
      date: string;
      time: string;
      venue: string;
      address: string;
      mapUrl: string;
    };
    reception: {
      title: string;
      date: string;
      time: string;
      venue: string;
      address: string;
      mapUrl: string;
    };
  };
  countdown: {
    showSection: boolean;
    targetDate: string; // ISO string e.g. 2026-10-24T11:00:00
    passedMessage: string;
  };
  moments: {
    showSection: boolean;
    title: string;
    subtitle: string;
    images: WeddingPhoto[];
  };
  dressCode: {
    showSection: boolean;
    title: string;
    colors: string;
    description: string;
    primaryHex: string;
    secondaryHex: string;
  };
  rsvpSettings: {
    showSection: boolean;
    title: string;
    subtitle: string;
    phoneContact: string;
    deadlineText: string;
    isEnabled: boolean;
  };
  giftInfo: {
    showSection: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    narrationNote: string;
    accounts: BankAccount[];
  };
  closing: {
    showSection: boolean;
    imageUrl: string;
    message: string;
    coupleSign: string;
  };
  updatedAt?: string;
}

export interface RsvpSubmission {
  id: string;
  name: string;
  attendance: 'yes' | 'no';
  guestCount: number;
  message?: string;
  phone?: string;
  submittedAt: string;
}
