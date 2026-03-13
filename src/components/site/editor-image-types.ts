import type { ChangeEvent } from "react";

export type EditorImageControls = {
  uploadingField: string;
  onHeroImageChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onGalleryImageChange: (index: number, event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onServiceImageChange: (index: number, event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onProductImageChange: (index: number, event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onTestimonialImageChange: (index: number, event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
};
