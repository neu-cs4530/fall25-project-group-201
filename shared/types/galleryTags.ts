/**
 * Enum for gallery post tags.
 */
export const GALLERY_TAGS = [
  'software_engineering',
  'fullstack',
  'frontend',
  'backend',
  'computer graphics',
  '3d_art',
  'modeling',
  'texturing',
  'rigging',
  'animation',
  'graphic_design',
  'illustration',
  'motion_graphics',
  'concept_art',
] as const;
export type GalleryTag = (typeof GALLERY_TAGS)[number];