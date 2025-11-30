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
    };

    const mediaDoc = new MediaModel(mediaToSave);
    const savedMedia = await mediaDoc.save();

    if (!savedMedia) {
      throw new Error('Failed to add media');
    }

    return savedMedia;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

/**
 * Deletes a media document
 * @param filepathLocation of the media
 * @returns the deleted media document
 */
const deleteMedia = async (filepathLocation: string): Promise<MediaResponse> => {
  try {
    // Decode URL-encoded characters (like %2F → /)
    const decodedPath = decodeURIComponent(filepathLocation);

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

<<<<<<< HEAD
// const getUniqueFilepath = async (
//   username: string,
//   requestedFilepath: string
// ): Promise<string> => {
//   // try {
//     // Extract the directory and filename from the requested path
//     // e.g., "/userData/john/photo.jpg" -> dir: "/userData/john/", filename: "photo.jpg"
//     const pathParts = requestedFilepath.split('/');
//     const filename = pathParts[pathParts.length - 1];

//     // Get the actual filesystem directory
//     const userDir = path.join(__dirname, '../../../client/public/userData/', username);

//     console.log('userDir', userDir);

//     // Ensure directory exists
//     if (!fs.existsSync(userDir)) {
//       fs.mkdirSync(userDir, { recursive: true });
//     }

//     // Extract name and extension
//     const lastDotIndex = filename.lastIndexOf('.');
//     const nameWithoutExt = filename.substring(0, lastDotIndex);
//     const ext = filename.substring(lastDotIndex);

//     let uniqueFilename = filename;
//     let counter = 1;

//     // Check if file exists, increment until we find an available name
//     while (fs.existsSync(path.join(userDir, uniqueFilename))) {
//       uniqueFilename = `${nameWithoutExt}(${counter})${ext}`;
//       counter++;
//     }

//     // Return the unique filepath in the same format as requested
//     return `/userData/${username}/${uniqueFilename}`;
//   // }
//   // catch (error) {
//   //   { error: (error as Error).message };
//   // }
// };

export default {
  addMedia,
  deleteMedia,
  formatFileSize,
};
=======
export default { addMedia, deleteMedia, formatFileSize };
>>>>>>> origin/main-backup
