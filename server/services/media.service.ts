import MediaModel from '../models/media.model';
import { Media, MediaResponse } from '../types/types';
import fs from 'fs';
import path from 'path';

export const addMedia = async (media: Media): Promise<MediaResponse> => {
  try {
    console.log("addMedia in service layer")
    if (!media.fileBuffer) {
      throw new Error('No file buffer provided');
    }

    // Decide where to copy the file inside your project
    const destPath = path.resolve(__dirname, '../uploads', media.filepathLocation);

    const buffer = Buffer.from(media.fileBuffer, 'base64');
    fs.writeFileSync(destPath, buffer);

    // Update the filepathLocation to the destination path
    const mediaToSave = {
      ...media,
      filepathLocation: destPath,
    };

    const newMedia = await MediaModel.create(mediaToSave);

    if (!newMedia) {
      throw new Error('Failed to create collection');
    }

    return newMedia;
  } catch (error) {
    return { error: (error as Error).message };
  }
};