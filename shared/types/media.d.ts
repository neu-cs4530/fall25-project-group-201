import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Media } from './media';

export interface Media {
  filepathLocation: string;
  fileBuffer?: base64;
  fileSize?: number;
  fileType?: string;
}


export interface DatabaseMedia extends Media {
  _id: ObjectId;
}

export type MediaResponse = DatabaseMedia | { error: string };

export interface CreateMediaRequest extends Request {
  body: Media;
}