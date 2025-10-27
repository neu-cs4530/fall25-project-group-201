import mongoose, { Model } from 'mongoose';
import mediaSchema from './schema/media.schema';
import { DatabaseMedia } from '../types/types';

const MediaModel: Model<DatabaseMedia> = mongoose.model<DatabaseMedia>('Media', mediaSchema);

export default MediaModel;
