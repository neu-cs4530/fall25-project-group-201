import mongoose, { Model } from 'mongoose';
import mediaSchema from './schema/media.schema';
import { DatabaseMedia } from '../types/types';

/**
 * Mongoose model for the Media collection.
 */
const MediaModel: Model<DatabaseMedia> = mongoose.model<DatabaseMedia>(
  'Media',
  mediaSchema,
);

export default MediaModel;

