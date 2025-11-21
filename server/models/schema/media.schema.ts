import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Media collection.
 *
 * This schema defines the structure of media used in questions, comments, and gallery posts
 * Each media includes the following fields:
 * - `filepathLocation`: Location of the file (either on the user's device or in the application, once copied over
 * - `fileBuffer`: fileBuffer of the original file (essential for copying the media file)
 * - `user`: username of whoever uploaded the media.
 */
const mediaSchema = new Schema(
  {
    filepathLocation: {
      type: String,
      required: true,
    },
    fileBuffer: {
      type: String,
      required: false,
    },
    fileSize: {
      type: String,
      required: false,
    },
    user: {
      type: String,
      required: true,
    },
  },
  { collection: 'Media' },
);

export default mediaSchema;
