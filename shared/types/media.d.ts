import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Media } from './media';

/**
 * Represents a Media
 * - `filepathLocation`: Location of the file (either on the user's device or in the application, once copied over
 * - `fileBuffer`: fileBuffer of the original file (essential for copying the media file)
 * - `user`: username of whoever uploaded the media.
 * - `fileSize`: file size of the media
 */
export interface Media {
  filepathLocation: string;
  filepathLocationClient: string;
  // fileBuffer?: base64;
  user: string;
  fileSize?: string;
}

/**
 * Represents a Database Media
 * _id - Object Id of the media document
 **/
export interface DatabaseMedia extends Media {
  _id: ObjectId;
}

/**
 * Type for media operation responses
 * Either returns a DatabaseMedia (successful operation) or an error message
 */
export type MediaResponse = DatabaseMedia | { error: string };

/**
 * Type definition for create media request
 */
export interface CreateMediaRequest extends Request {
  body: Media;
}
