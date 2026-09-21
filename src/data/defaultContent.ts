import { WeddingContent } from '../types';

export const INITIAL_WEDDING_PHOTOS = [
  {
    id: 'photo-hero',
    url: 'https://res.cloudinary.com/dtws4emsj/image/upload/v1787842758/XMKY6848_qbmmzt.jpg',
    caption: 'Faithfulness & Taiwo',
    alt: 'Faithfulness and Taiwo portrait',
    isHero: true,
  },
  {
    id: 'photo-gallery-1',
    url: 'https://res.cloudinary.com/dtws4emsj/image/upload/v1788559424/XCTB8068_h5voqs.jpg',
    caption: 'Together Forever',
    alt: 'Faithfulness and Taiwo celebration',
    isHero: false,
    isClosing: true,
  },
  {
    id: 'photo-gallery-2',
    url: 'https://res.cloudinary.com/dtws4emsj/image/upload/v1788559442/YIRY3537_amf4st.jpg',
    caption: 'A Journey of Love',
    alt: 'Faithfulness and Taiwo smiling together',
    isHero: false,
  },
];

export const DEFAULT_WEDDING_CONTENT: WeddingContent = {
  hero: {
    coupleNames: 'FAITHFULNESS & TAIWO',
    tagline: 'are getting married',
    dateDisplay: '24 OCTOBER 2026',
    imageUrl: 'https://res.cloudinary.com/dtws4emsj/image/upload/v1787842758/XMKY6848_qbmmzt.jpg',
    scrollIndicatorText: 'Scroll to celebrate',
  },
  invitation: {
    showSection: true,
    families: 'ADEJORO-OMILEGBE & WIGWE FAMILIES',
    invitationLead: 'Together with their families, invite you to celebrate the wedding of their children',
    coupleNames: 'FAITHFULNESS & TAIWO',
    bibleVerse: 'Above all put on love, which binds everything together in perfect harmony.',
    verseReference: 'Colossians 3:14',
  },
  weddingDay: {
    showSection: true,
    ceremony: {
      title: 'CEREMONY',
      date: '24 October 2026',
      time: '11:00 AM',
      venue: "Faith & Miracle Int'l Church",
      address: 'Alalubosa Junction, Aleshinloye Road, Ibadan',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Faith+%26+Miracle+Intl+Church+Alalubosa+Junction+Aleshinloye+Road+Ibadan',
    },
    reception: {
      title: 'RECEPTION',
      date: '24 October 2026',
      time: 'Immediately following ceremony',
      venue: 'Le Chateau Event Center',
      address: 'Housing, 43A Awolowo Avenue, Bodija Estate',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Le+Chateau+Event+Center+Housing+43A+Awolowo+Avenue+Bodija+Estate+Ibadan',
    },
  },
  countdown: {
    showSection: true,
    targetDate: '2026-10-24T11:00:00',
    passedMessage: 'Happily Married & Forever United in Love',
  },
  moments: {
    showSection: true,
    title: 'OUR MOMENTS',
    subtitle: 'A glimpse into the cherished steps of our journey',
    images: INITIAL_WEDDING_PHOTOS,
  },
  dressCode: {
    showSection: true,
    title: 'DRESS CODE',
    colors: 'Purple & Sea Green',
    description: 'We kindly request our esteemed guests to celebrate with us adorned in rich tones of Purple & Sea Green.',
    primaryHex: '#4B0082', // Purple
    secondaryHex: '#2E8B57', // Sea Green
  },
  rsvpSettings: {
    showSection: true,
    title: "WE'D LOVE TO CELEBRATE WITH YOU",
    subtitle: 'Please honor us with your RSVP so we may prepare adequately for your presence.',
    phoneContact: '0810052629310',
    deadlineText: 'Kindly respond on or before 10 October 2026',
    isEnabled: true,
  },
  giftInfo: {
    showSection: true,
    title: 'YOUR PRESENCE IS THE GREATEST GIFT',
    subtitle: 'For those who wish to bless us with a gift:',
    buttonText: 'VIEW GIFT INFORMATION',
    narrationNote: 'Kindly convert your gift to Cash and send to the accounts below. Please indicate your name in the payment narration.',
    accounts: [
      {
        bankName: 'GT Bank',
        accountName: 'Faithfulness Deborah Adejoro-Omilegbe',
        accountNumber: '1010916362',
      },
      {
        bankName: 'Opay',
        accountName: 'Wigwe Taiwo',
        accountNumber: '8033982696',
      },
    ],
  },
  closing: {
    showSection: true,
    imageUrl: 'https://res.cloudinary.com/dtws4emsj/image/upload/v1788559424/XCTB8068_h5voqs.jpg',
    message: "WE CAN'T WAIT TO CELEBRATE WITH YOU.",
    coupleSign: 'FAITHFULNESS & TAIWO',
  },
};
