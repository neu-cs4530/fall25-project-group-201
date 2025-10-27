import MediaModel from '../models/media.model';
import { Media, MediaResponse } from '../types/types';
import fs from 'fs';
import path from 'path';

export const addMedia = async (media: Media) => {
  try {
    console.log("addMedia in service layer");

    const userDir = path.resolve(__dirname, `../userData/${media.user}`);

    // Ensure the directory exists
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true }); 
    }

    // Then save the file inside that directory
    const destPath = path.join(userDir, media.filepathLocation);


    fs.writeFileSync(destPath, media.fileBuffer); // write file to disk

    // Only store metadata + path in MongoDB
    const mediaToSave = {
      filepathLocation: destPath, // path on disk
      user: media.user
    };

    const newMedia = await MediaModel.create(mediaToSave);

    if (!newMedia) throw new Error('Failed to create media');

    return newMedia;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

