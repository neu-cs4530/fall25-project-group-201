
export const GalleryTags = [
  'graphic_design',
  'illustration',
  'motion_graphics',
  'concept_art',

  'software_engineering',
  'fullstack',
  'frontend',
  'backend',

  '3d_art',
  'modeling',
  'texturing',
  'rigging',
  'animation',
] as const;

export type GalleryTag = typeof GalleryTags[number];
