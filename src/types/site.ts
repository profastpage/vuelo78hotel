export type ClientModules = {
  whatsappCTA: boolean;
  leadForm: boolean;
  booking: boolean;
  blog: boolean;
  auth: boolean;
  cart: boolean;
  payments: boolean;
  multiTenant: boolean;
};

export type ClientBrandConfig = {
  businessDescription: string;
  offerSummary: string;
  primaryGoal: string;
  specialty: string;
  copyStyle: string;
  whatsappNumber: string;
  email: string;
  themeMode: string;
  visualStyle: string;
  layoutMode?: string;
  shellMode?: string;
  textAlign?: string;
  buttonShape?: string;
  starterKit?: string;
  artDirection?: string;
  positioningMode?: string;
  visualConcept: string;
  layoutMood: string;
  visualSignature: string;
  accentColor: string;
  accentAltColor: string;
};

export type ClientProfile = {
  clientCode: string;
  clientName: string;
  businessName: string;
  folderName: string;
  projectType: string;
  industry: string;
  createdAt: string;
  templateVersion?: string;
  reference?: {
    enabled: boolean;
    website: string;
    captureMode?: string;
  };
  modules: ClientModules;
  brandConfig: ClientBrandConfig;
};

export type BriefData = {
  businessName: string;
  projectType: "Landing Page" | "Website" | "E-commerce";
  industry: string;
  businessDescription: string;
  mainOffer: string;
  primaryGoal: string;
  targetAudience: string;
  location: string;
  contact: {
    whatsapp: string;
    email: string;
  };
  brand: {
    themeMode: "Light" | "Dark";
    visualStyle: string;
    layoutMode: string;
    shellMode: string;
    textAlign: "left" | "center";
    buttonShape: "rounded" | "square";
    primaryColor: string;
    secondaryColor: string;
    copyStyle: string;
    visualConcept: string;
    layoutMood: string;
    visualSignature: string;
    starterKit?: string;
  };
  reference?: {
    enabled: boolean;
    website: string;
    captureMode?: string;
  };
  hero: {
    tag: string;
    headline: string;
    subtitle: string;
  };
  services: Array<{
    title: string;
    description: string;
  }>;
  benefits: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    quote: string;
  }>;
  cta: {
    primaryLabel: string;
    secondaryLabel: string;
    contactTitle: string;
    contactDescription: string;
  };
  products: Array<{
    name: string;
    price: string;
    description: string;
  }>;
  keywords: string[];
  pages: string[];
  strategy?: {
    starterKit?: string;
    starterKitLabel?: string;
    brandThesis?: string;
    positioning?: string;
    proofAngle?: string;
    ctaStrategy?: string;
    artDirection?: string;
    recommendedSkillSequence?: string[];
  };
  designSystem?: {
    starterKit?: string;
    typographySystem?: string;
    densityProfile?: string;
    motionProfile?: string;
    surfaceProfile?: string;
  };
  scorecardTargets?: {
    visual?: number;
    conversion?: number;
    trust?: number;
    responsive?: number;
    content?: number;
  };
};

export type ReferenceSnapshotWidget = {
  name: string;
  count: number;
};

export type ReferenceSnapshotSection = {
  index: number;
  label: string;
  type: string;
  headings: string[];
  widgets: string[];
  cardCount: number;
  hasMedia: boolean;
  ctaCount: number;
  layout: string;
};

export type ReferenceSnapshot = {
  sourceUrl: string;
  capturedAt: string;
  meta?: {
    title?: string;
    description?: string;
    language?: string;
  };
  widgets: ReferenceSnapshotWidget[];
  sections: ReferenceSnapshotSection[];
  designTokens?: {
    palette?: string[];
    fonts?: string[];
    radii?: string[];
    heroMediaUrl?: string;
  };
  assets?: {
    stylesheets?: string[];
    imageCount?: number;
    videoCount?: number;
  };
};

// Shared section types
export type PricingTier = {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
  highlighted?: boolean;
};

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  avatarSrc?: string;
};

export type TimelineItem = {
  year: string;
  title: string;
  description?: string;
};

export type BookingWidgetOption = {
  id: string;
  label: string;
  roomType: string;
  price: string;
  rateLabel: string;
  stayLabel: string;
  summary: string;
  perks: string[];
  emoji?: string;
  badge?: string;
  highlighted?: boolean;
};

export type BookingWidgetPreset =
  | "hotel"
  | "restaurant"
  | "education"
  | "course"
  | "service"
  | "maintenance"
  | "construction"
  | "sales"
  | "ecommerce";

export type LocationInfo = {
  address: string;
  city?: string;
  hours?: string;
  mapsEmbedUrl?: string;
  mapsLink?: string;
};

export type ImagePosition = {
  mobileX?: number;
  mobileY?: number;
  x?: number;
  y?: number;
};

// Site content schema
export type SiteContent = {
  brand: {
    name: string;
    headline: string;
    description: string;
    subheadline: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    heroTag: string;
    heroImageSrc?: string;
    heroImagePosition?: ImagePosition;
  };
  narrative: {
    title: string;
    body: string;
    goal: string;
  };
  theme: {
    mode: string;
    visualStyle: string;
    layoutMode?: string;
    shellMode?: string;
    textAlign?: string;
    buttonShape?: string;
    starterKit?: string;
    accentColor: string;
    accentAltColor: string;
  };
  uiText?: {
    heroLabel?: string;
    supportLabel?: string;
    proofLabel?: string;
    storyChip?: string;
    storyTitle?: string;
    testimonialsChip?: string;
    testimonialsTitle?: string;
    faqChip?: string;
    faqTitle?: string;
  };
  visibility?: {
    highlights?: boolean[];
    galleryItems?: boolean[];
    services?: boolean[];
    products?: boolean[];
    testimonials?: boolean[];
    faqs?: boolean[];
  };
  stats: Array<{
    label: string;
    value: string;
  }>;
  services: Array<{
    title: string;
    description: string;
    imageSrc?: string;
    imagePosition?: ImagePosition;
  }>;
  highlights: string[];
  testimonials: Array<{
    name: string;
    role: string;
    quote: string;
    avatarSrc?: string;
    location?: string;
    segment?: string;
    rating?: number;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  pages: string[];
  products: Array<{
    name: string;
    price: string;
    description: string;
    imageSrc?: string;
    imagePosition?: ImagePosition;
  }>;
  galleryKeywords: string[];
  galleryItems?: Array<{
    title: string;
    subtitle: string;
    imageSrc?: string;
    imagePosition?: ImagePosition;
  }>;
  contact: {
    title: string;
    description: string;
    whatsappNumber: string;
    email: string;
  };
  bookingWidget?: {
    preset?: BookingWidgetPreset;
    title?: string;
    description?: string;
    adminLabel?: string;
    adminRole?: string;
    adminStatus?: string;
    actionVerb?: string;
    triggerChatLabel?: string;
    triggerChatHint?: string;
    triggerActionLabel?: string;
    triggerActionHint?: string;
    tabChatLabel?: string;
    tabActionLabel?: string;
    chatCtaLabel?: string;
    chatCtaHint?: string;
    directWhatsappLabel?: string;
    directWhatsappHint?: string;
    bookingCtaLabel?: string;
    summaryLabel?: string;
    summaryText?: string;
    formNameLabel?: string;
    formNamePlaceholder?: string;
    scheduleLabel?: string;
    schedulePlaceholder?: string;
    scheduleInputType?: "date" | "text";
    quantityLabel?: string;
    quantityOptions?: string[];
    notesLabel?: string;
    notesPlaceholder?: string;
    selectionTitle?: string;
    detailLabel?: string;
    priceLabel?: string;
    timelineLabel?: string;
    options: BookingWidgetOption[];
  };
  pricing?: {
    title?: string;
    description?: string;
    tiers: PricingTier[];
  };
  team?: {
    title?: string;
    description?: string;
    members: TeamMember[];
  };
  timeline?: {
    title?: string;
    description?: string;
    items: TimelineItem[];
  };
  location?: LocationInfo;
};
