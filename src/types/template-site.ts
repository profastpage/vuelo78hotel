export type TemplateKind = "hotel" | "restaurant" | "store" | "services";

export type TemplateImagePosition = {
  x?: number;
  y?: number;
};

export type TemplateNavigationItem = {
  label: string;
  href: string;
};

export type TemplateAction = {
  label: string;
  href: string;
};

export type TemplateSocialLink = {
  label: string;
  href: string;
  icon: string;
};

export type TemplateHeroSlide = {
  title: string;
  imageSrc: string;
  imageFallbackSrc?: string;
  mobileImageSrc?: string;
  mobileImageFallbackSrc?: string;
  position?: TemplateImagePosition;
  mobilePosition?: TemplateImagePosition;
};

export type TemplateFeatureItem = {
  title: string;
  description: string;
  icon: string;
};

export type TemplateGalleryItem = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
};

export type TemplateServiceItem = {
  name: string;
  description: string;
  meta?: string;
  price?: string;
  icon?: string;
  imageSrc?: string;
};

export type TemplateTestimonialItem = {
  name: string;
  location: string;
  quote: string;
  rating: number;
  avatarSrc?: string;
};

export type TemplateSectionHeader = {
  eyebrow: string;
  title: string;
  description: string;
};

export type TemplateSiteConfig = {
  template: TemplateKind;
  meta: {
    title: string;
    description: string;
  };
  brand: {
    name: string;
    tagline: string;
    logoSrc?: string;
    logoAlt?: string;
    whatsapp: string;
    email: string;
    location: string;
  };
  theme: {
    mode: "light" | "dark";
    accentColor: string;
    accentAltColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    mutedColor: string;
  };
  navigation: TemplateNavigationItem[];
  hero: TemplateSectionHeader & {
    primaryCta: TemplateAction;
    secondaryCta?: TemplateAction;
    benefits: Array<{
      icon: string;
      label: string;
    }>;
    slides: TemplateHeroSlide[];
  };
  features: TemplateSectionHeader & {
    items: TemplateFeatureItem[];
  };
  gallery: TemplateSectionHeader & {
    items: TemplateGalleryItem[];
  };
  services: TemplateSectionHeader & {
    items: TemplateServiceItem[];
  };
  testimonials: TemplateSectionHeader & {
    items: TemplateTestimonialItem[];
  };
  contact: TemplateSectionHeader & {
    whatsappLabel: string;
    whatsappHref: string;
    emailLabel: string;
    address: string;
    hours?: string;
    mapEmbedUrl?: string;
    socialLinks?: TemplateSocialLink[];
  };
  footer: {
    copyright: string;
    note?: string;
  };
};
