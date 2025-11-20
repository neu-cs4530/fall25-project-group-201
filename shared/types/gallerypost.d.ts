import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * Represents a Gallery post
 * - `title`: title of the gallery post.
 * - `description`: description of the gallery post.
 * - `user`: user which authored the gallery post.
 * - `media`: media URL or media path for the gallery post.
 * - `thumbnailMedia`: thumbnailMedia URL or thumbnailMedia path for the gallery post, if the media is 3D (.glb file)
 * - `community`: communityID to which this gallery post belongs.
 * - `postedAt`: when the galler post was posted.
 */
export interface GalleryPost {
  title: string;
  description: string;
  user: string;
  media: string;
  thumbnailMedia?: string;
  community: string;
  postedAt: Date;
  views: number;
  downloads: number;
  likes: string[];
  mediaSize: string;
  tags: GalleryTag[];
}

/**
 * Represents a Database gallery post
 * _id - Object Id of the gallery post document
 */
export interface DatabaseGalleryPost extends GalleryPost {
  _id: ObjectId;
}

/**
 * Type for gallery post operation responses
 * Either returns a DatabaseGalleryPost (successful operation) or an error message
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
    views: number;
    downloads: number;
    likes: string[];
    mediaSize: string;
    tags: GalleryTag[];
  };
}

/**
 * Type definition for a gallery post request that contains galleryPostId in params and username in query
 */
export interface GalleryPostRequest extends Request {
  params: {
    galleryPostId: string;
  };
  query: {
    username: string;
  };
}
