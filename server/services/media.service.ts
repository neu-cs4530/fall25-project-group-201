import MediaModel from '../models/media.model';
import { Media, MediaResponse } from '../types/types';
import fs from 'fs';
import path from 'path';

/**
 * Creates a media document (and copies the media file from user's device to the application)
 * @param media - the media object to be created
 **/
const addMedia = async (media: Media): Promise<MediaResponse> => {
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

const deleteMedia = async (
  filepathLocation: string
): Promise<MediaResponse> => {
  try {
    // Decode URL-encoded characters (like %2F → /)
    const decodedPath = decodeURIComponent(filepathLocation);

    console.log('decoded path, ', decodedPath)

    // Find and delete the document
    const deleted = await MediaModel.findOneAndDelete({ filepathLocation: decodedPath });

    if (!deleted) {
      return { error: 'Media not found' };
    }

    return deleted; // or return { success: true }
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export default { addMedia, deleteMedia };
