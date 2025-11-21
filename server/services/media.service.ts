import MediaModel from '../models/media.model';
import { Media, MediaResponse } from '../types/types';
import fs from 'fs';
import path from 'path';

/**
 * Converts bytes to a human-readable string
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
};

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

    // Get file size in human-readable format
    const fileSize = formatFileSize(media.fileBuffer.length);

    // Only store metadata + path in MongoDB
    const mediaToSave = {
      filepathLocation: `/userData/${media.user}/${filename}`,
      user: media.user,
      fileSize,
      isDownloadable: media.isDownloadable,
    };

    const mediaDoc = new MediaModel(mediaToSave);
    const savedMedia = await mediaDoc.save();
    return savedMedia;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export default { addMedia };
