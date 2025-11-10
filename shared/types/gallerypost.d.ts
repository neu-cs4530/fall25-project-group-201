import { ObjectId } from 'mongodb';
import { Request } from 'express';

export interface GalleryPost {
  title: string;
  description: string;
  user: string;
  media: string;
  thumbnailMedia?: string;
  community: string;
  postDateTime: Date;
}

export interface DatabaseGalleryPost extends GalleryPost {
  _id: ObjectId;
}

/**
 * Represents a response for a collection operation.
 * - Either a `DatabaseCollection` object or an error message.
 */
export type GalleryPostResponse = DatabaseGalleryPost | { error: string };

/**
 * Type definition for create gallery post request
 */
export interface CreateGalleryPostRequest extends Request {
  body: {
    title: string;
    description: string;
    user: string;
    media: string;
    community: string;
    postedAt: Date;
    thumbnailMedia?: string;
  };
}

export interface GalleryPostRequest extends Request {
  params: {
    galleryPostId: string;
  };
  query: {
    username: string;
  };
}
