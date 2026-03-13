export type EditorCollectionKey = "galleryItems" | "services" | "products" | "testimonials" | "faqs";

export type EditorItemControls = {
  onRemoveItem?: (collection: EditorCollectionKey, index: number) => void;
};
