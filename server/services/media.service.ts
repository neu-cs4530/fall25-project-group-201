import MediaModel from '../models/media.model';
import { Media, MediaResponse } from '../types/types';
import fs from 'fs';
import path from 'path';

export const addMedia = async (media: Media) => {
  try {
    console.log("addMedia in service layer");

    const userDir = path.resolve(__dirname, '../../client/public/userData', media.user);

    // Make sure the directory exists
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Extract the filename
    const filename = media.filepathLocation; // just the file name

    // Then save the file inside that directory
    const destPath = path.join(userDir, filename);

    console.log("destPath ", destPath)

    fs.writeFileSync(destPath, media.fileBuffer); // write file to disk

    // Only store metadata + path in MongoDB (relative path for browser)
    const mediaToSave = {
      filepathLocation: `/userData/${media.user}/${filename}`,
      user: media.user
    };

    const newMedia = await MediaModel.create(mediaToSave);

    if (!newMedia) throw new Error('Failed to create media');

    return newMedia;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

