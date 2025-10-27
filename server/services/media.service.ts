import MediaModel from '../models/media.model';
import { Media, MediaResponse } from '../types/types';

export const addMedia = async (media: Media): Promise<MediaResponse> => {
  try {
    const newMedia = await MediaModel.create(media);

    if (!newMedia) {
      throw new Error('Failed to create collection');
    }

    return newMedia;
  } catch (error) {
    return { error: (error as Error).message };
  }
};