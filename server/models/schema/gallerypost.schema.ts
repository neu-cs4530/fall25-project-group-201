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
      required: true,
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
  },
  { collection: 'GalleryPost' },
);

export default galleryPostSchema;
