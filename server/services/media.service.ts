import MediaModel from '../models/media.model';
import { Media, DatabaseMedia, MediaResponse } from '../types/types';
import fs from 'fs';
import path from 'path';

export const addMedia = async (media: Media): Promise<MediaResponse> => {
  console.log('addMedia in service layer');

  try {
    const userDir = path.resolve(__dirname, '../../client/public/userData', media.user);

    // Make sure the directory exists
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Extract the filename
    const filename = media.filepathLocation;

    // Save the file inside that directory
    const destPath = path.join(userDir, filename);
    console.log('destPath ', destPath);
    fs.writeFileSync(destPath, media.fileBuffer);

    // Only store metadata + path in MongoDB
    const mediaToSave = {
      filepathLocation: `/userData/${media.user}/${filename}`,
      user: media.user,
    };

    const mediaDoc = new MediaModel(mediaToSave);
    const savedMedia = await mediaDoc.save();
    return savedMedia;
  } catch (error) {
    return { error: (error as Error).message };
  }
};
