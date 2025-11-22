import { GALLERY_TAGS } from '../../types/galleryTags';
import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Gallery Post collection.
 *
 * This schema defines the structure of a gallery post in the database.
 * Each gallery post includes the following fields:
 * - title
 * - description
 * - user
 * - media
 * - community (ID)
 * - thumbnailMedia
 * - post date and time
 * - thumbnailMedia
 * - views
 * - downloads
 * - likes
 * - media size
 * - link
 */
const galleryPostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    media: {
      type: String,
      required: false,
    },
    community: {
      type: String,
      required: true,
    },
    postedAt: {
      type: Date,
    },
    thumbnailMedia: {
      type: String,
      required: false,
    },
    views: {
      type: Number,
      default: [],
    },
    downloads: {
      type: Number,
      default: 0,
    },
    likes: {
      type: [String],
      default: [],
    },
    mediaSize: {
      type: String,
      required: false,
      default: '',
    },
    tags: {
      type: [String],
      enum: GALLERY_TAGS,
      default: [],
      required: false,
    },
    link: {
      type: String,
      required: false,
      default: '',
    },
  },
  { collection: 'GalleryPost' },
);

export default galleryPostSchema;
