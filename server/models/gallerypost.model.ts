import mongoose, { Model } from 'mongoose';
import { DatabaseGalleryPost } from '../types/types';
import galleryPostSchema from './schema/gallerypost.schema';

const GalleryPostModel: Model<DatabaseGalleryPost> = mongoose.model<DatabaseGalleryPost>(
  'GalleryPost',
  galleryPostSchema,
);

export default GalleryPostModel;
