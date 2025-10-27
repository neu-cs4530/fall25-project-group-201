import MediaModel from '../models/media.model';
import { Media, MediaResponse } from '../types/types';
import fs from 'fs';
import path from 'path';

export const addMedia = async (media: Media) => {
  try {
    console.log("addMedia in service layer");

    const destPath = path.resolve(__dirname, '../uploads', media.filepathLocation);

    fs.writeFileSync(destPath, media.fileBuffer); // write file to disk

    // Only store metadata + path in MongoDB
    const mediaToSave = {
      filepathLocation: destPath, // path on disk
      fileSize: media.fileSize,
      fileType: media.fileType,
    };

    const newMedia = await MediaModel.create(mediaToSave);

    if (!newMedia) throw new Error('Failed to create media');

    return newMedia;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

