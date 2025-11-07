import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Gallery collection.
 *
 * This schema defines the structure of a gallery post in the database.
 * Each gallery post includes the following fields: (tentative)
 * - title
 * - description
 * - author (by username)
 * - model (by filepath, referencing the Media Schema type)
 * - post date and time
 */
const galleryPostSchema: Schema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    author: {
      type: String,
    },
    model: {
      type: String,
    },
    postDateTime: {
      type: Date,
    },
  },
  { collection: 'GalleryPost' },
);

export default galleryPostSchema;
